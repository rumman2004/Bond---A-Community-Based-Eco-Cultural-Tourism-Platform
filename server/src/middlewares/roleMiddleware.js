// ============================================================
// middlewares/roleMiddleware.js
// Role-based access control. MUST run after protect middleware
// so req.user is already set.
//
// Role hierarchy in this project:
//   tourist    — book, review, report, favorites
//   community  — manage their own experiences, bookings, stories
//   security   — verify communities, handle reports, suspend users
//   admin      — everything + user management + analytics
//
// Usage in routes:
//   router.get('/admin/users',       protect, authorise('admin'),              getUsers)
//   router.get('/security/pending',  protect, authorise('security', 'admin'),  getPendingCommunities)
//   router.post('/bookings',         protect, authorise('tourist'),             createBooking)
//   router.post('/experiences',      protect, authorise('community'),           createExperience)
// ============================================================

import { ApiError } from '../utils/apiError.js';

// ── authorise(...roles) ───────────────────────────────────────
// Returns middleware that only allows users whose role is in
// the provided list. Call with one or more allowed roles.
export const authorise = (...roles) => (req, res, next) => {
  if (!req.user) {
    // protect middleware should have run first
    return next(new ApiError(401, 'Not authenticated'));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}`)
    );
  }

  next();
};

// ── Convenience aliases ───────────────────────────────────────
// These keep route files readable without repeating string arrays.

// Only tourists can book, review, save favorites
export const touristOnly = authorise('tourist');

// Only community owners can manage their own content
export const communityOnly = authorise('community');

// Security team (security + admin can both access moderation routes)
export const securityOnly = authorise('security', 'admin');

// Admin-only routes (platform management, analytics)
export const adminOnly = authorise('admin');

// Any authenticated user with an operational role
// (excludes nothing — just documents intent in route files)
export const anyRole = authorise('tourist', 'community', 'security', 'admin');

// ── authorize alias ───────────────────────────────────────────
// American-spelling alias used by route files that import { authorize }
export const authorize = authorise;