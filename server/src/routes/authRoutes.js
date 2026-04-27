import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  forgotPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateRequest.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from '../validators/authValidator.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────
router.post('/register',        authLimiter, validate(registerSchema),        register);
router.post('/login',           authLimiter, validate(loginSchema),           login);
router.post('/refresh-token',               refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema),  forgotPassword);

// ── Protected ─────────────────────────────────────────────────
router.post  ('/logout',          authenticate, logout);
router.get   ('/me',              authenticate, getMe);
router.patch ('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;