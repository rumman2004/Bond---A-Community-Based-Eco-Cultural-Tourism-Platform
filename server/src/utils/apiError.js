// ============================================================
// utils/apiError.js
// Custom error class that carries HTTP status + message.
// Used by all controllers via:  throw new ApiError(404, 'Not found')
// Caught and formatted by errorHandler middleware.
// ============================================================

export class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message    = message;
    this.success    = false;
    this.errors     = errors;   // optional array of field-level errors

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}