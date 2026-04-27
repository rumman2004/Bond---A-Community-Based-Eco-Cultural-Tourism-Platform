// ============================================================
// validators/communityValidator.js
// ============================================================

import { body } from 'express-validator';

// ── Create community ──────────────────────────────────────────
export const validateCreateCommunity = [
  body('name')
    .trim()
    .notEmpty().withMessage('Community name is required')
    .isLength({ min: 3, max: 255 }).withMessage('Name must be 3–255 characters'),

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
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Short description max 500 characters'),

  body('village')
    .trim()
    .notEmpty().withMessage('Village is required'),

  body('district')
    .trim()
    .notEmpty().withMessage('District is required'),

  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),

  body('country')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),

  body('pincode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('Pincode max 20 characters'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),


  body('languages_spoken')
    .optional()
    .isArray().withMessage('Languages must be an array'),

  body('best_visit_season')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
];

// ── Update community (all fields optional) ────────────────────
export const validateUpdateCommunity = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Name must be 3–255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),

  body('short_description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Short description max 500 characters'),

  body('pincode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('Pincode max 20 characters'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),


  body('languages_spoken')
    .optional()
    .isArray().withMessage('Languages must be an array'),

  body('best_visit_season')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }),
];

// ── Update sustainability tags ────────────────────────────────
export const validateUpdateTags = [
  body('tag_ids')
    .isArray().withMessage('tag_ids must be an array')
    .custom((arr) => {
      if (!arr.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error('Each tag_id must be a positive integer');
      }
      return true;
    }),
];

// ── Aliases ───────────────────────────────────────────────────
export const createCommunitySchema    = validateCreateCommunity;
export const updateCommunitySchema    = validateUpdateCommunity;
export const sustainabilityTagsSchema = validateUpdateTags;