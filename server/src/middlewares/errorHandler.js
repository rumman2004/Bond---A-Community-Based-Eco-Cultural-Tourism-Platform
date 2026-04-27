// ============================================================
// middlewares/errorHandler.js
// Global Express error handler — must be registered LAST in
// app.js after all routes:
//
//   app.use(notFound)       // catches unknown routes
//   app.use(errorHandler)   // catches everything else
//
// Handles:
//   ApiError          — our own thrown errors (known status + message)
//   JWT errors        — clear messages without leaking internals
//   PostgreSQL errors — pg error codes mapped to HTTP responses
//   Multer errors     — file upload rejections
//   Unknown errors    — safe 500 in production, full stack in dev
// ============================================================

import { ApiError } from '../utils/apiError.js';
import { logger }   from '../utils/logger.js';
import { env }      from '../config/env.js';

const isDev = env.isDev;

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log every error — include stack in dev, message-only in prod
  logger.error(
    isDev
      ? `${err.message}\n${err.stack}`
      : `${req.method} ${req.originalUrl} → ${err.message}`
  );

  // ── 1. Our own ApiError ────────────────────────────────────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success:    false,
      statusCode: err.statusCode,
      message:    err.message,
      errors:     err.errors?.length ? err.errors : undefined,
    });
  }

  // ── 2. JWT errors (from jsonwebtoken library) ─────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false, statusCode: 401, message: 'Invalid token',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false, statusCode: 401, message: 'Token expired',
    });
  }

  // ── 3. PostgreSQL / pg errors ─────────────────────────────
  if (err.code) {
    // Unique constraint violation  (e.g. duplicate email)
    if (err.code === '23505') {
      const detail = err.detail || '';
      const field  = detail.match(/\((.+?)\)/)?.[1] ?? 'field';
      return res.status(409).json({
        success: false, statusCode: 409,
        message: `A record with this ${field} already exists`,
      });
    }

    // Foreign key violation  (referencing a non-existent row)
    if (err.code === '23503') {
      return res.status(400).json({
        success: false, statusCode: 400,
        message: 'Referenced record does not exist',
      });
    }

    // Not-null violation
    if (err.code === '23502') {
      return res.status(400).json({
        success: false, statusCode: 400,
        message: `Required field missing: ${err.column}`,
      });
    }

    // Invalid UUID format passed to pg
    if (err.code === '22P02') {
      return res.status(400).json({
        success: false, statusCode: 400, message: 'Invalid ID format',
      });
    }
  }

  // ── 4. Multer errors (file upload) ───────────────────────
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE:  'File size exceeds the allowed limit',
      LIMIT_FILE_COUNT: 'Too many files uploaded at once',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field name',
    };
    return res.status(400).json({
      success: false, statusCode: 400,
      message: messages[err.code] ?? 'File upload error',
    });
  }

  // ── 5. SyntaxError — malformed JSON body ─────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false, statusCode: 400, message: 'Invalid JSON in request body',
    });
  }

  // ── 6. Unknown / unhandled error ─────────────────────────
  // Never leak stack traces or internal details in production
  return res.status(500).json({
    success:    false,
    statusCode: 500,
    message:    isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
};

export default errorHandler;

// Named export alias (used by app.js as import { errorHandler })
export { errorHandler };