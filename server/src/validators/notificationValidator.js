// ============================================================
// validators/notificationValidator.js
// Covers: updatePreferences
// ============================================================

import { body } from 'express-validator';

export const validateUpdatePreferences = [
  body('in_app_enabled')
    .optional()
    .isBoolean().withMessage('in_app_enabled must be a boolean'),

  body('email_bookings')
    .optional()
    .isBoolean().withMessage('email_bookings must be a boolean'),

  body('email_reviews')
    .optional()
    .isBoolean().withMessage('email_reviews must be a boolean'),

  body('email_messages')
    .optional()
    .isBoolean().withMessage('email_messages must be a boolean'),

  body('email_promotions')
    .optional()
    .isBoolean().withMessage('email_promotions must be a boolean'),

  body('email_weekly_digest')
    .optional()
    .isBoolean().withMessage('email_weekly_digest must be a boolean'),

  body('push_bookings')
    .optional()
    .isBoolean().withMessage('push_bookings must be a boolean'),

  body('push_reviews')
    .optional()
    .isBoolean().withMessage('push_reviews must be a boolean'),

  body('push_messages')
    .optional()
    .isBoolean().withMessage('push_messages must be a boolean'),

  body('push_reminders')
    .optional()
    .isBoolean().withMessage('push_reminders must be a boolean'),
];

// ── Schema alias ──────────────────────────────────────────────
export const notificationPreferencesSchema = validateUpdatePreferences;