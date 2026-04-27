// ============================================================
// validators/bookingValidator.js
// Covers: createBooking, cancelBooking, rejectBooking
// ============================================================

import { body } from 'express-validator';

// ── Create booking ────────────────────────────────────────────
export const validateCreateBooking = [
  body('experience_id')
    .notEmpty().withMessage('experience_id is required')
    .isUUID().withMessage('experience_id must be a valid UUID'),

  body('booking_date')
    .notEmpty().withMessage('Booking date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('booking_date must be in YYYY-MM-DD format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),

  body('num_guests')
    .notEmpty().withMessage('num_guests is required')
    .isInt({ min: 1 }).withMessage('At least 1 guest is required'),

  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Special requests max 1000 characters'),
];

// ── Cancel / reject booking ────────────────────────────────────
export const validateCancelBooking = [
  body('cancellation_reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Cancellation reason max 500 characters'),
];

export const validateRejectBooking = [
  body('cancellation_reason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required')
    .isLength({ max: 500 }).withMessage('Rejection reason max 500 characters'),
];

// ── Schema aliases ────────────────────────────────────────────
export const createBookingSchema = validateCreateBooking;
export const cancelBookingSchema = validateCancelBooking;
export const rejectBookingSchema = validateRejectBooking;