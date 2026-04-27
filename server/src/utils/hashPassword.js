// ============================================================
// utils/hashPassword.js
// Thin wrappers around bcrypt so controllers don't import
// bcrypt directly (except authController which already does).
// authController uses bcrypt directly — these helpers are
// available for any future service that needs them.
// ============================================================

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword  = (plain)         => bcrypt.hash(plain, SALT_ROUNDS);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);