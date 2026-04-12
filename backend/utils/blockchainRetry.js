/**
 * Blockchain Retry Utility
 * Implements exponential backoff with jitter for blockchain transaction retries
 */

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay with jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000ms)
 * @param {number} maxDelay - Maximum delay in milliseconds (default: 30000ms)
 * @returns {number} - Delay in milliseconds
 */
const calculateBackoffDelay = (attempt, baseDelay = 1000, maxDelay = 30000) => {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (random 0-20% of delay) to prevent thundering herd
  const jitter = Math.random() * 0.2 * exponentialDelay;
  return Math.floor(exponentialDelay + jitter);
};

/**
 * Retry a blockchain operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 30000)
 * @param {Function} options.shouldRetry - Function to determine if error should trigger retry
 * @param {Function} options.onRetry - Callback function called before each retry
 * @returns {Promise} - Result of the operation
 */
const retryWithBackoff = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = defaultShouldRetry,
    onRetry = null,
  } = options;

  let lastError;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateBackoffDelay(attempt, baseDelay, maxDelay);
      
      console.log(
        `🔄 Blockchain operation failed (attempt ${attempt + 1}/${maxRetries + 1}). ` +
        `Retrying in ${delay}ms... Error: ${error.message}`
      );

      // Call onRetry callback if provided
      if (onRetry) {
        await onRetry(attempt, error, delay);
      }

      await sleep(delay);
      attempt++;
    }
  }

  throw lastError;
};

/**
 * Default function to determine if an error should trigger a retry
 * @param {Error} error - The error object
 * @returns {boolean} - True if should retry
 */
const defaultShouldRetry = (error) => {
  const retryableErrors = [
    "network timeout",
    "connection refused",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
    "nonce too low",
    "replacement transaction underpriced",
    "insufficient funds for gas",
    "timeout",
    "rate limit",
    "too many requests",
    "server error",
  ];

  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = error.code?.toLowerCase() || "";

  // Check if error message or code contains retryable patterns
  const isRetryable = retryableErrors.some(
    (pattern) =>
      errorMessage.includes(pattern.toLowerCase()) ||
      errorCode.includes(pattern.toLowerCase())
  );

  return isRetryable;
};

/**
 * Check if blockchain error is related to network issues
 * @param {Error} error - The error object
 * @returns {boolean} - True if network-related error
 */
const isNetworkError = (error) => {
  const networkErrors = [
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
    "network",
    "timeout",
    "connection",
  ];

  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = error.code?.toLowerCase() || "";

  return networkErrors.some(
    (pattern) =>
      errorMessage.includes(pattern) || errorCode.includes(pattern)
  );
};

/**
 * Check if blockchain error is related to transaction issues
 * @param {Error} error - The error object
 * @returns {boolean} - True if transaction-related error
 */
const isTransactionError = (error) => {
  const txErrors = [
    "nonce",
    "gas",
    "underpriced",
    "insufficient funds",
    "revert",
    "execution reverted",
  ];

  const errorMessage = error.message?.toLowerCase() || "";
  
  return txErrors.some((pattern) => errorMessage.includes(pattern));
};

/**
 * Parse blockchain error and return user-friendly message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
const parseBlockchainError = (error) => {
  const errorMessage = error.message?.toLowerCase() || "";

  if (errorMessage.includes("insufficient funds")) {
    return "Insufficient funds for gas. Please ensure wallet has enough balance.";
  }

  if (errorMessage.includes("nonce too low")) {
    return "Transaction nonce issue. Please retry the operation.";
  }

  if (errorMessage.includes("gas")) {
    return "Gas estimation failed. The transaction may fail or cost estimation unavailable.";
  }

  if (errorMessage.includes("revert") || errorMessage.includes("execution reverted")) {
    return "Smart contract execution reverted. Please check transaction parameters.";
  }

  if (isNetworkError(error)) {
    return "Network connection issue. Please check your connection and try again.";
  }

  if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
    return "Rate limit exceeded. Please wait a moment and try again.";
  }

  // Return original error message if no specific match
  return error.message || "Unknown blockchain error occurred.";
};

module.exports = {
  retryWithBackoff,
  calculateBackoffDelay,
  defaultShouldRetry,
  isNetworkError,
  isTransactionError,
  parseBlockchainError,
  sleep,
};
