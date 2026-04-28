// ============================================================
// validators/experienceValidator.js
// Covers: createExperience, updateExperience
// ============================================================

import { body } from 'express-validator';
import { EXPERIENCE_CATEGORIES, EXPERIENCE_DIFFICULTIES, EXPERIENCE_STATUSES } from '../utils/constants.js';

// ── Create experience ─────────────────────────────────────────
export const validateCreateExperience = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 255 }).withMessage('Title must be 5–255 characters'),

  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase letters, numbers, and hyphens only'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),

  body('short_description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Short description max 500 characters'),

  body('category')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      const tags = value.split(',').map(t => t.trim().toLowerCase());
      const invalid = tags.filter(t => t && !EXPERIENCE_CATEGORIES.includes(t));
      if (invalid.length > 0) {
        throw new Error(`Invalid categories: ${invalid.join(', ')}`);
      }
      return true;
    }),

  body('difficulty')
    .optional()
    .isIn(EXPERIENCE_DIFFICULTIES)
    .withMessage(`Difficulty must be: ${EXPERIENCE_DIFFICULTIES.join(', ')}`),

  body('duration_hours')
    .optional()
    .isFloat({ min: 0.5 }).withMessage('Duration must be at least 0.5 hours'),

  body('duration_days')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration days must be at least 1'),

  body('price_per_person')
    .notEmpty().withMessage('Price per person is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 10 }).withMessage('Invalid currency code'),

  body('min_participants')
    .optional()
    .isInt({ min: 1 }).withMessage('Minimum participants must be at least 1'),

  body('max_participants')
    .optional()
    .isInt({ min: 1 }).withMessage('Maximum participants must be at least 1')
    .custom((max, { req }) => {
      const min = req.body.min_participants;
      if (min && parseInt(max) < parseInt(min)) {
        throw new Error('max_participants must be >= min_participants');
      }
      return true;
    }),

  body('included_items')
    .optional()
    .isArray().withMessage('included_items must be an array'),

  body('excluded_items')
    .optional()
    .isArray().withMessage('excluded_items must be an array'),

  body('meeting_point')
    .optional()
    .trim()
    .isLength({ max: 500 }),

  body('languages')
    .optional()
    .isArray().withMessage('Languages must be an array'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

// ── Update experience (all fields optional) ───────────────────
export const validateUpdateExperience = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 }).withMessage('Title must be 5–255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),

  body('short_description')
    .optional()
    .trim()
    .isLength({ max: 500 }),

  body('category')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      const tags = value.split(',').map(t => t.trim().toLowerCase());
      const invalid = tags.filter(t => t && !EXPERIENCE_CATEGORIES.includes(t));
      if (invalid.length > 0) {
        throw new Error(`Invalid categories: ${invalid.join(', ')}`);
      }
      return true;
    }),

  body('difficulty')
    .optional()
    .isIn(EXPERIENCE_DIFFICULTIES)
    .withMessage(`Invalid difficulty`),

  body('price_per_person')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('min_participants')
    .optional()
    .isInt({ min: 1 }),

  body('max_participants')
    .optional()
    .isInt({ min: 1 }),

  body('status')
    .optional()
    .isIn(EXPERIENCE_STATUSES).withMessage(`Invalid status`),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }),

  body('languages')
    .optional()
    .isArray(),
];

// ── Schema aliases ────────────────────────────────────────────
export const createExperienceSchema = validateCreateExperience;
export const updateExperienceSchema = validateUpdateExperience;