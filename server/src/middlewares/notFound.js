// ============================================================
// middlewares/notFound.js
// Catches any request that didn't match a defined route and
// forwards a clean 404 ApiError to errorHandler.
//
// Register in app.js AFTER all routes, BEFORE errorHandler:
//   app.use(notFound)
//   app.use(errorHandler)
// ============================================================

import { ApiError } from '../utils/apiError.js';

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;

// Named export alias (used by app.js as import { notFound })
export { notFound };