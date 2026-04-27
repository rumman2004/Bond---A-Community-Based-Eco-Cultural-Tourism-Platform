// ============================================================
// validators/authValidator.js
// Covers: register, login, changePassword, forgotPassword
// Used with validateRequest middleware via express-validator
// ============================================================

import { body } from 'express-validator';

// ── Register ─────────────────────────────────────────────────
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['tourist', 'community']).withMessage('Role must be tourist or community'),
];

// ── Login ─────────────────────────────────────────────────────
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Change password ───────────────────────────────────────────
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain at least one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must differ from current password');
      }
      return true;
    }),
];

// ── Forgot password ───────────────────────────────────────────
export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
];

// ── Schema aliases ────────────────────────────────────────────
// Route files import these names (e.g. registerSchema, loginSchema)
export const registerSchema        = validateRegister;
export const loginSchema           = validateLogin;
export const changePasswordSchema  = validateChangePassword;
export const forgotPasswordSchema  = validateForgotPassword;