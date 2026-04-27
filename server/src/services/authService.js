import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const SALT_ROUNDS = 12;

// ─── Password ────────────────────────────────────────────────────────────────

/**
 * Hash a plain-text password.
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// ─── Token Generation ────────────────────────────────────────────────────────

/**
 * Generate a signed JWT access token.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} signed JWT
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id:    payload.id,
      email: payload.email,
      role:  payload.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Verify and decode a JWT access token.
 * @param {string} token
 * @returns {{ id: string, email: string, role: string, iat: number, exp: number }}
 * @throws {ApiError} 401 if token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid token. Please log in again.");
  }
};

/**
 * Extract the raw token from an Authorization header.
 * Supports "Bearer <token>" format.
 * @param {string} authHeader — req.headers.authorization
 * @returns {string} raw token
 * @throws {ApiError} 401 if header is missing or malformed
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token missing.");
  }
  return authHeader.split(" ")[1];
};

/**
 * Full pipeline: extract → verify → return decoded payload.
 * Convenience wrapper used in authMiddleware.
 * @param {string} authHeader
 * @returns decoded token payload
 */
export const authenticateToken = (authHeader) => {
  const token = extractTokenFromHeader(authHeader);
  return verifyAccessToken(token);
};

// ─── Password Reset Token ────────────────────────────────────────────────────

/**
 * Generate a short-lived password reset token (15 min).
 * @param {string} userId
 * @returns {string} signed JWT
 */
export const generatePasswordResetToken = (userId) => {
  return jwt.sign({ id: userId, purpose: "password_reset" }, env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Verify a password reset token.
 * @param {string} token
 * @returns {{ id: string, purpose: string }}
 * @throws {ApiError} if invalid, expired, or wrong purpose
 */
export const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.purpose !== "password_reset") {
      throw new ApiError(400, "Invalid reset token.");
    }
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "TokenExpiredError") {
      throw new ApiError(400, "Reset link has expired. Please request a new one.");
    }
    throw new ApiError(400, "Invalid reset token.");
  }
};

// ─── Role Helpers ─────────────────────────────────────────────────────────────

export const ROLES = Object.freeze({
  TOURIST:   "tourist",
  COMMUNITY: "community",
  SECURITY:  "security",
  ADMIN:     "admin",
});

/**
 * Check whether a role string is valid.
 * @param {string} role
 * @returns {boolean}
 */
export const isValidRole = (role) => Object.values(ROLES).includes(role);