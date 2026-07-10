import toast from "react-hot-toast";

/**
 * Centralized error handling utility
 * Provides user-friendly error messages and retry capabilities
 */

export const ErrorMessages = {
  NETWORK: "Network error. Please check your connection and try again.",
  TIMEOUT: "Request timed out. Please try again.",
  UNAUTHORIZED: "Session expired. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
  VALIDATION: "Please check your input and try again.",
  AI_BUSY: "AI service is busy. Please try again in a moment.",
  AI_QUOTA: "Daily limit reached. Upgrade to premium for unlimited access.",
  UNKNOWN: "Something went wrong. Please try again.",
};

/**
 * Parse error from API response
 */
export const parseApiError = (error) => {
  // Network error (no response)
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return { message: ErrorMessages.TIMEOUT, code: "TIMEOUT" };
    }
    return { message: ErrorMessages.NETWORK, code: "NETWORK" };
  }

  const status = error.response.status;
  const data = error.response.data;

  // Extract message from API response
  const apiMessage = data?.message || data?.error || "";

  switch (status) {
    case 400:
      return { message: apiMessage || ErrorMessages.VALIDATION, code: "BAD_REQUEST" };
    case 401:
      return { message: ErrorMessages.UNAUTHORIZED, code: "UNAUTHORIZED" };
    case 403:
      return { message: ErrorMessages.FORBIDDEN, code: "FORBIDDEN" };
    case 404:
      return { message: apiMessage || ErrorMessages.NOT_FOUND, code: "NOT_FOUND" };
    case 429:
      if (apiMessage.toLowerCase().includes("quota") || apiMessage.toLowerCase().includes("limit")) {
        return { message: ErrorMessages.AI_QUOTA, code: "QUOTA_EXCEEDED" };
      }
      return { message: apiMessage || ErrorMessages.RATE_LIMIT, code: "RATE_LIMIT" };
    case 500:
    case 502:
    case 503:
    case 504:
      if (apiMessage.toLowerCase().includes("ai") || apiMessage.toLowerCase().includes("groq")) {
        return { message: ErrorMessages.AI_BUSY, code: "AI_ERROR" };
      }
      return { message: apiMessage || ErrorMessages.SERVER_ERROR, code: "SERVER_ERROR" };
    default:
      return { message: apiMessage || ErrorMessages.UNKNOWN, code: "UNKNOWN" };
  }
};

/**
 * Handle error with toast notification
 */
export const handleError = (error, customMessage = null) => {
  const { message, code } = parseApiError(error);
  const displayMessage = customMessage || message;
  
  toast.error(displayMessage, {
    duration: code === "QUOTA_EXCEEDED" ? 6000 : 4000,
  });

  if (import.meta.env.DEV) {
    console.error("[Error Handler]", { code, message, error });
  }

  return { message, code };
};

/**
 * Retry wrapper for async functions
 */
export const withRetry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableErrors = ["NETWORK", "TIMEOUT", "SERVER_ERROR"],
    onRetry = null,
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const { code } = parseApiError(error);

      // Don't retry if error is not retryable
      if (!retryableErrors.includes(code)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, maxRetries);
      }
    }
  }

  throw lastError;
};

/**
 * Create an AbortController with timeout
 */
export const createAbortController = (timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  };
};

/**
 * Async operation state manager
 */
export class AsyncState {
  constructor() {
    this.operations = new Map();
  }

  start(operationId) {
    const { controller, cleanup } = createAbortController();
    this.operations.set(operationId, { controller, cleanup });
    return controller.signal;
  }

  cancel(operationId) {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.controller.abort();
      operation.cleanup();
      this.operations.delete(operationId);
    }
  }

  complete(operationId) {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.cleanup();
      this.operations.delete(operationId);
    }
  }

  cancelAll() {
    this.operations.forEach((operation) => {
      operation.controller.abort();
      operation.cleanup();
    });
    this.operations.clear();
  }
}

export default {
  parseApiError,
  handleError,
  withRetry,
  createAbortController,
  AsyncState,
  ErrorMessages,
};
