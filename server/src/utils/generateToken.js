// ============================================================
// utils/generateToken.js
// JWT helpers + password hashing.
// Uses bcrypt (same as authController — NOT bcryptjs).
// Install: npm install jsonwebtoken bcrypt
// ============================================================

import jwt    from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env }      from '../config/env.js';
import { ApiError } from './apiError.js';

const SALT_ROUNDS = 12;

// ── Password ──────────────────────────────────────────────────
export const hashPassword    = (plain)       => bcrypt.hash(plain, SALT_ROUNDS);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

// ── Token payload ─────────────────────────────────────────────
// Keep small — only what every downstream middleware needs
const buildPayload = (user) => ({
  id:    user.id,
  email: user.email,
  role:  user.role,
});

// ── Access token (short-lived) ────────────────────────────────
export const generateAccessToken = (user) =>
  jwt.sign(buildPayload(user), env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '15m',
  });

// ── Refresh token (long-lived, httpOnly cookie) ───────────────
export const generateRefreshToken = (user) =>
  jwt.sign(buildPayload(user), env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

// ── Verify access token ───────────────────────────────────────
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid token. Please log in again.');
  }
};

// ── Verify refresh token ──────────────────────────────────────
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }
};

// ── Extract Bearer token from header ─────────────────────────
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization token missing.');
  }
  return authHeader.split(' ')[1];
};

// ── Password reset token (15 min, JWT-based) ─────────────────
export const generatePasswordResetToken = (userId) =>
  jwt.sign({ id: userId, purpose: 'password_reset' }, env.JWT_SECRET, { expiresIn: '15m' });

export const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.purpose !== 'password_reset') throw new ApiError(400, 'Invalid reset token.');
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'TokenExpiredError') throw new ApiError(400, 'Reset link expired. Request a new one.');
    throw new ApiError(400, 'Invalid reset token.');
  }
};

// ── Role constants ─────────────────────────────────────────────
export const ROLES = Object.freeze({
  TOURIST:   'tourist',
  COMMUNITY: 'community',
  SECURITY:  'security',
  ADMIN:     'admin',
});