// ============================================================
// middlewares/rateLimiter.js
// Rate limiting using express-rate-limit.
// Install: npm install express-rate-limit
//
// Three limiters for different threat surfaces:
//   authLimiter    — login / register (brute-force protection)
//   uploadLimiter  — image uploads (cost + abuse protection)
//   apiLimiter     — all other API routes (general DDoS protection)
//
// Usage in routes:
//   router.post('/login',    authLimiter,   login)
//   router.post('/register', authLimiter,   register)
//   router.post('/upload',   uploadLimiter, uploadImage)
//
// Usage in app.js (apply apiLimiter globally):
//   app.use('/api', apiLimiter)
// ============================================================

import rateLimit from 'express-rate-limit';

// ── Shared error response format ──────────────────────────────
// Matches our ApiResponse / ApiError shape so the frontend can
// handle rate limit errors the same way as other API errors.
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success:    false,
    statusCode: 429,
    message:    'Too many requests. Please slow down and try again later.',
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000), // Unix timestamp
  });
};

// ── Auth limiter ──────────────────────────────────────────────
// 10 attempts per 15 minutes per IP.
// Tight — login brute-force protection is critical.
export const authLimiter = rateLimit({
  windowMs:         10 * 60 * 1000, // 10 minutes
  max:              20,
  standardHeaders:  true,           // sends RateLimit-* headers (RFC 6585)
  legacyHeaders:    false,
  skipSuccessfulRequests: true,     // only count failed requests
  handler:          rateLimitHandler,
  message:          'Too many login attempts. Try again in 15 minutes.',
});

// ── Upload limiter ────────────────────────────────────────────
// 20 uploads per hour per user.
// Keyed by user ID (from req.user) when available, fallback to IP.
export const uploadLimiter = rateLimit({
  windowMs:   60 * 60 * 1000, // 1 hour
  max:        20,
  keyGenerator: (req) => req.user?.id ?? (req.ip || 'anonymous'),
  validate:   false, // disable validations — primary key is user-ID, not raw IP
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         rateLimitHandler,
});

// ── General API limiter ───────────────────────────────────────
// 200 requests per 15 minutes per IP.
// Applied globally to all /api/* routes in app.js.
export const apiLimiter = rateLimit({
  windowMs:   15 * 60 * 1000, // 15 minutes
  max:        200,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         rateLimitHandler,
});