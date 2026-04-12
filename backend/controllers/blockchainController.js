const { prisma } = require("../config/postgres");
const {
  getContract,
  getNetworkConfig,
  getTransactionUrl,
  estimateGas,
} = require("../config/blockchain");
const crypto = require("crypto");
const {
  retryWithBackoff,
  parseBlockchainError,
  isNetworkError,
  isTransactionError,
} = require("../utils/blockchainRetry");

/**
 * Generate SHA-256 hash of data
 * @param {string} data - Data to hash
 * @returns {string} Hex string of hash
 */
const hashData = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * POST /api/blockchain/store
 * Store data on blockchain with transaction tracking in database
 * body: { id: "deal-123", data: "some verified search data" }
 */
const storeOnChain = async (req, res) => {
  let dbTransaction = null;

  try {
    const { id, data } = req.body;

    // Validation
    if (!id || !data) {
      return res.status(400).json({
        success: false,
        message: "Both 'id' and 'data' are required",
      });
    }

    // Generate data hash for verification
    const dataHash = hashData(JSON.stringify(data));
    const networkConfig = getNetworkConfig();

    // Create initial database record
    dbTransaction = await prisma.blockchainTransaction.create({
      data: {
        recordId: id,
        dataHash,
        transactionHash: "pending",
        blockNumber: 0,
        networkName: networkConfig.currentNetwork,
        status: "pending",
      },
    });

    console.log(
      `📝 Created blockchain transaction record (ID: ${dbTransaction.id}) for recordId: ${id}`
    );

    // Execute blockchain transaction with retry logic
    const result = await retryWithBackoff(
      async (attempt) => {
        console.log(`🔗 Attempting to store on blockchain (attempt ${attempt + 1})...`);
        
        const contract = getContract();

        // Estimate gas first
        let gasEstimate;
        try {
          gasEstimate = await estimateGas("store", [id, JSON.stringify(data)]);
          console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
        } catch (gasError) {
          console.warn(`⚠️ Gas estimation failed: ${gasError.message}`);
        }

        // Send transaction with optional gas limit
        const txOptions = gasEstimate
          ? { gasLimit: (gasEstimate * BigInt(120)) / BigInt(100) } // Add 20% buffer
          : {};

        const tx = await contract.store(id, JSON.stringify(data), txOptions);
        console.log(`📤 Transaction sent: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

        return { tx, receipt };
      },
      {
        maxRetries: 3,
        baseDelay: 2000,
        maxDelay: 30000,
        onRetry: async (attempt, error, delay) => {
          // Update database with retry information
          await prisma.blockchainTransaction.update({
            where: { id: dbTransaction.id },
            data: {
              retryCount: attempt + 1,
              errorMessage: error.message,
            },
          });
        },
      }
    );

    const { tx, receipt } = result;

    // Update database with successful transaction details
    const updatedTransaction = await prisma.blockchainTransaction.update({
      where: { id: dbTransaction.id },
      data: {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        status: "confirmed",
        gasUsed: receipt.gasUsed?.toString() || null,
        errorMessage: null,
        updatedAt: new Date(),
      },
    });

    const explorerUrl = getTransactionUrl(tx.hash);

    return res.json({
      success: true,
      message: "Data stored on blockchain successfully",
      data: {
        recordId: id,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        dataHash,
        network: networkConfig.currentNetwork,
        gasUsed: receipt.gasUsed?.toString(),
        explorerUrl,
        dbRecordId: updatedTransaction.id,
        timestamp: updatedTransaction.timestamp,
      },
    });
  } catch (error) {
    console.error("❌ Error in storeOnChain:", error);

    // Update database with failure
    if (dbTransaction) {
      try {
        await prisma.blockchainTransaction.update({
          where: { id: dbTransaction.id },
          data: {
            status: "failed",
            errorMessage: error.message,
            updatedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.error("❌ Failed to update transaction status:", dbError);
      }
    }

    // Determine appropriate error response
    const statusCode = isNetworkError(error) ? 503 : 500;
    const userMessage = parseBlockchainError(error);

    return res.status(statusCode).json({
      success: false,
      message: "Blockchain store failed",
      error: userMessage,
      details: {
        isNetworkError: isNetworkError(error),
        isTransactionError: isTransactionError(error),
        retryable: isNetworkError(error),
      },
    });
  }
};

/**
 * GET /api/blockchain/fetch/:id
 * Fetch data from blockchain and include database transaction history
 */
const fetchFromChain = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    // Fetch from blockchain with retry
    const blockchainData = await retryWithBackoff(
      async () => {
        const contract = getContract();
        if (typeof contract.fetch === "function") {
          return contract.fetch(id);
        }
        if (typeof contract.retrieve === "function") {
          return contract.retrieve(id);
        }
        throw new Error("Contract does not support fetch/retrieve in this environment.");
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
      }
    );

    // Parse blockchain response
    const data = blockchainData.data ?? blockchainData[0];
    const timestamp = blockchainData.timestamp ?? blockchainData[1];

    // Fetch transaction history from database
    const dbTransactions = await prisma.blockchainTransaction.findMany({
      where: { recordId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        transactionHash: true,
        blockNumber: true,
        timestamp: true,
        networkName: true,
        status: true,
        gasUsed: true,
        retryCount: true,
        createdAt: true,
      },
    });

    const networkConfig = getNetworkConfig();

    return res.json({
      success: true,
      data: {
        recordId: id,
        data: data ? JSON.parse(data) : null,
        blockchainTimestamp: timestamp ? Number(timestamp) : null,
        network: networkConfig.currentNetwork,
        transactionHistory: dbTransactions.map((tx) => ({
          ...tx,
          explorerUrl:
            tx.transactionHash !== "pending"
              ? getTransactionUrl(tx.transactionHash)
              : null,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error in fetchFromChain:", error);

    const statusCode = isNetworkError(error) ? 503 : 500;
    const userMessage = parseBlockchainError(error);

    return res.status(statusCode).json({
      success: false,
      message: "Blockchain fetch failed",
      error: userMessage,
      details: {
        isNetworkError: isNetworkError(error),
        retryable: isNetworkError(error),
      },
    });
  }
};

/**
 * GET /api/blockchain/transactions
 * Get all blockchain transactions from database
 */
const getTransactions = async (req, res) => {
  try {
    const { status, recordId, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (recordId) where.recordId = recordId;

    const [transactions, total] = await Promise.all([
      prisma.blockchainTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.blockchainTransaction.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        transactions: transactions.map((tx) => ({
          ...tx,
          explorerUrl:
            tx.transactionHash !== "pending"
              ? getTransactionUrl(tx.transactionHash)
              : null,
        })),
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getTransactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

/**
 * GET /api/blockchain/transaction/:txHash
 * Get specific transaction details by transaction hash
 */
const getTransactionByHash = async (req, res) => {
  try {
    const { txHash } = req.params;

    const transaction = await prisma.blockchainTransaction.findUnique({
      where: { transactionHash: txHash },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.json({
      success: true,
      data: {
        ...transaction,
        explorerUrl: getTransactionUrl(transaction.transactionHash),
      },
    });
  } catch (error) {
    console.error("❌ Error in getTransactionByHash:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};

/**
 * GET /api/blockchain/stats
 * Get blockchain transaction statistics
 */
const getStats = async (req, res) => {
  try {
    const [total, confirmed, pending, failed] = await Promise.all([
      prisma.blockchainTransaction.count(),
      prisma.blockchainTransaction.count({ where: { status: "confirmed" } }),
      prisma.blockchainTransaction.count({ where: { status: "pending" } }),
      prisma.blockchainTransaction.count({ where: { status: "failed" } }),
    ]);

    const networkConfig = getNetworkConfig();

    return res.json({
      success: true,
      data: {
        totalTransactions: total,
        confirmedTransactions: confirmed,
        pendingTransactions: pending,
        failedTransactions: failed,
        successRate: total > 0 ? ((confirmed / total) * 100).toFixed(2) : 0,
        currentNetwork: networkConfig.currentNetwork,
        networkName: networkConfig.currentNetwork,
      },
    });
  } catch (error) {
    console.error("❌ Error in getStats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

module.exports = {
  storeOnChain,
  fetchFromChain,
  getTransactions,
  getTransactionByHash,
  getStats,
};
