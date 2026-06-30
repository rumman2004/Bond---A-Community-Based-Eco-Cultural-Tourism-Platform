// ============================================================
// validators/communityVerificationValidator.js
// Validation schemas for the multi-step community registration
// verification wizard (Steps 2, 3, 4).
// ============================================================

import { body } from 'express-validator';

// ── Step 2A: Team members + per-member ID details ─────────────
// Body: { members: [{ full_name, phone, role?, is_owner?,
//                      id_type, id_number, id_image_url?, id_link? }] }
const VALID_ID_TYPES = ['Aadhaar', 'PAN', 'Passport', 'Voter ID', 'Driving License'];

export const membersSchema = [
  body('members')
    .isArray({ min: 1 })
    .withMessage('At least one team member is required'),

  body('members.*.full_name')
    .trim()
    .notEmpty().withMessage('Each member must have a full name')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),

  body('members.*.phone')
    .trim()
    .notEmpty().withMessage('Each member must have a phone number')
    .matches(/^[+]?[\d\s\-().]{7,20}$/)
    .withMessage('Invalid phone number format'),

  body('members.*.role')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Role must be under 100 characters'),

  body('members.*.is_owner')
    .optional()
    .isBoolean().withMessage('is_owner must be boolean'),

  body('members.*.id_type')
    .trim()
    .notEmpty().withMessage('Each member must have an ID type')
    .isIn(VALID_ID_TYPES).withMessage(`ID type must be one of: ${VALID_ID_TYPES.join(', ')}`),

  body('members.*.id_number')
    .trim()
    .notEmpty().withMessage('Each member must have an ID number')
    .isLength({ max: 50 }).withMessage('ID number must be under 50 characters'),

  body('members.*.id_link')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('ID link must be a valid URL')
    .isLength({ max: 1000 }).withMessage('ID link is too long'),

  // Each member needs at least one form of ID proof: an uploaded image or a link.
  body('members.*').custom((member) => {
    if (!member?.id_image_url && !member?.id_link) {
      throw new Error('Each member must have an ID image or an ID link');
    }
    return true;
  }),
];

// ── Step 3: Offerings ─────────────────────────────────────────
// Body: { offerings: [{ category, custom_label?, description? }] }
const VALID_CATEGORIES = ['homestay', 'food', 'event', 'custom'];

export const offeringsSchema = [
  body('offerings')
    .isArray({ min: 1 })
    .withMessage('At least one offering is required'),

  body('offerings.*.category')
    .notEmpty().withMessage('Each offering must have a category')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('offerings.*.custom_label')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Custom label must be under 255 characters'),

  body('offerings.*.description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
];

// ── Step 4: Consent ───────────────────────────────────────────
// Body: { accepted: true }
export const consentSchema = [
  body('accepted')
    .exists().withMessage('accepted field is required')
    .isBoolean().withMessage('accepted must be a boolean')
    .custom((val) => {
      if (val !== true) throw new Error('You must accept the terms and conditions');
      return true;
    }),
];
