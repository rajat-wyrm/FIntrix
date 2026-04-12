const express = require("express");
const {
  storeOnChain,
  fetchFromChain,
  getTransactions,
  getTransactionByHash,
  getStats,
} = require("../controllers/blockchainController");

const router = express.Router();

// GET /api/blockchain - Test endpoint
router.get("/", (req, res) => {
  res.json({ message: "Blockchain API is active", endpoints: ["/store", "/fetch/:id", "/transactions", "/transaction/:txHash", "/stats"] });
});

// Store data on blockchain
router.post("/store", storeOnChain);

// Fetch data from blockchain by record ID
router.get("/fetch/:id", fetchFromChain);

// Get all blockchain transactions with filtering
router.get("/transactions", getTransactions);

// Get specific transaction by hash
router.get("/transaction/:txHash", getTransactionByHash);

// Get blockchain statistics
router.get("/stats", getStats);

module.exports = router;
