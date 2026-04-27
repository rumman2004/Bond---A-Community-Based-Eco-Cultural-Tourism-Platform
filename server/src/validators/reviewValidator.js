// ============================================================
// validators/reviewValidator.js
// Covers: createReview, updateReview, hideReview
// ============================================================

import { body } from 'express-validator';

// ── Create review ─────────────────────────────────────────────
export const validateCreateReview = [
  body('booking_id')
    .notEmpty().withMessage('booking_id is required')
    .isUUID().withMessage('booking_id must be a valid UUID'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Title max 255 characters'),

  body('body')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Review body max 3000 characters'),
];

// ── Update review (all fields optional) ───────────────────────
export const validateUpdateReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 }),

  body('body')
    .optional()
    .trim()
    .isLength({ max: 3000 }),
];

// ── Hide review (security/admin) ──────────────────────────────
export const validateHideReview = [
  body('hidden_reason')
    .trim()
    .notEmpty().withMessage('A reason is required to hide a review')
    .isLength({ max: 500 }),
];

// ── Schema aliases ────────────────────────────────────────────
export const createReviewSchema = validateCreateReview;
export const updateReviewSchema = validateUpdateReview;
export const hideReviewSchema   = validateHideReview;