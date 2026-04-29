import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

// ─── Register ────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, role = 'tourist' } = req.body;

  const allowedRoles = ['tourist', 'community'];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, 'Invalid role. Allowed: tourist, community');
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    throw new ApiError(409, 'Email already registered');
  }

  // Check username uniqueness if provided
  if (username) {
    const takenUsername = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (takenUsername.rowCount > 0) throw new ApiError(409, 'Username already taken');
  }

  const password_hash = await bcrypt.hash(password, 12);

  const result = await query(
    `INSERT INTO users (full_name, username, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name AS name, username, email, role, status, avatar_url, created_at`,
    [name, username || null, email, password_hash, role]
  );

  const user = result.rows[0];
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info(`New user registered: ${user.email} (${user.role})`);

  res
    .status(201)
    .cookie('refreshToken', refreshToken, cookieOptions())
    .json(new ApiResponse(201, { user, accessToken }, 'Registration successful'));
});

// ─── Login ───────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await query(
    `SELECT id, full_name AS name, username, email, password_hash, role, status, avatar_url
     FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(401, 'Invalid email or password');

  if (user.status === 'suspended') throw new ApiError(403, 'Account suspended. Contact support.');
  if (user.status === 'banned')    throw new ApiError(403, 'Account banned.');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const { password_hash, ...safeUser } = user;
  const accessToken  = generateAccessToken(safeUser);
  const refreshToken = generateRefreshToken(safeUser);

  logger.info(`User logged in: ${user.email}`);

  res
    .cookie('refreshToken', refreshToken, cookieOptions())
    .json(new ApiResponse(200, { user: safeUser, accessToken }, 'Login successful'));
});

// ─── Refresh Token ───────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  const decoded = verifyRefreshToken(token);

  const result = await query(
    `SELECT id, full_name AS name, username, email, role, status, avatar_url
     FROM users WHERE id = $1`,
    [decoded.id]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(401, 'User no longer exists');
  if (user.status === 'suspended' || user.status === 'banned') {
    throw new ApiError(403, 'Account access revoked');
  }

  const accessToken     = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  res
    .cookie('refreshToken', newRefreshToken, cookieOptions())
    .json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

// ─── Logout ──────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' })
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

// ─── Get current user (me) ───────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, full_name AS name, username, email, role, status,
            avatar_url, phone, bio, country, city,
            email_verified AS is_verified, last_login_at, created_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(404, 'User not found');

  res.json(new ApiResponse(200, { user }, 'User fetched'));
});

// ─── Change Password ─────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await query(
    'SELECT id, password_hash FROM users WHERE id = $1',
    [req.user.id]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  const newHash = await bcrypt.hash(newPassword, 12);
  await query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHash, user.id]
  );

  logger.info(`Password changed for user: ${req.user.id}`);

  res.json(new ApiResponse(200, null, 'Password changed successfully'));
});

// ─── Forgot Password ─────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await query('SELECT id, full_name AS name FROM users WHERE email = $1', [email]);
  if (result.rowCount === 0) {
    return res.json(new ApiResponse(200, null, 'If that email exists, a reset link has been sent'));
  }

  // TODO: generate reset token, store hash in DB, send via emailService
  logger.info(`Password reset requested for: ${email}`);

  res.json(new ApiResponse(200, null, 'If that email exists, a reset link has been sent'));
});

// ─── Helper: cookie options ───────────────────────────────────
const cookieOptions = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
});