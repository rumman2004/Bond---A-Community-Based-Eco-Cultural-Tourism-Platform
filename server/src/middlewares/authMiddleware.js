// ============================================================
// middlewares/authMiddleware.js
// Verifies the JWT access token from the Authorization header
// and attaches { id, role } to req.user.
//
// Controllers rely on:
//   req.user.id   — used in every controller
//   req.user.role — used in bookingController, securityController
//
// Usage in routes:
//   router.get('/me', protect, getMe)
//   router.post('/bookings', protect, createBooking)
// ============================================================

import { verifyAccessToken } from '../utils/generateToken.js';
import { ApiError }          from '../utils/apiError.js';
import { asyncHandler }      from '../utils/asyncHandler.js';
import { query }             from '../config/db.js';
// ── protect ──────────────────────────────────────────────────
// Requires a valid Bearer token. Attaches the full live user
// row to req.user (so status changes like suspensions take
// effect immediately without waiting for a token refresh).
export const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract token from  Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access token missing');
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify signature + expiry — throws ApiError(401) if invalid
  const decoded = verifyAccessToken(token);

  // 3. Re-fetch user from DB so suspended/banned status is live
  const result = await query(
    `SELECT id, email, role, status, full_name, avatar_url
     FROM users WHERE id = $1`,
    [decoded.id]
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  if (user.status === 'suspended') {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  if (user.status === 'banned') {
    throw new ApiError(403, 'Your account has been permanently banned.');
  }

  // 4. Attach to request — available as req.user in all downstream handlers
  req.user = user;
  next();
});

// ── optionalProtect ───────────────────────────────────────────
// Same as protect but does NOT reject unauthenticated requests.
// Sets req.user if a valid token is present, otherwise leaves
// req.user undefined.
// Use for public routes that show extra info to logged-in users.
export const optionalProtect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // no token — continue as guest
  }

  try {
    const token   = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const result = await query(
      `SELECT id, email, role, status, full_name, avatar_url
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    const user = result.rows[0];
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // Invalid token on an optional route — silently ignore
  }

  next();
});
// ── authenticate alias ────────────────────────────────────────
// All route files import { authenticate } — this is the same as protect.
export const authenticate = protect;