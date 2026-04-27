// ============================================================
// utils/asyncHandler.js
// Wraps async route handlers so any thrown error (including
// ApiError) is forwarded to Express's next(err) automatically.
// Usage: export const myHandler = asyncHandler(async (req, res) => { ... })
// ============================================================

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};