// ============================================================
// scripts/resetAdminPassword.js
// One-off CLI to reset a user's password by email.
//
// Usage:
//   node src/scripts/resetAdminPassword.js <email> <newPassword>
// ============================================================

import pool from '../config/db.js';
import { hashPassword } from '../utils/hashPassword.js';
import { findUserByEmail, updateUserPassword } from '../models/userModel.js';

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error('Usage: node src/scripts/resetAdminPassword.js <email> <newPassword>');
  process.exit(1);
}

try {
  const { rows } = await findUserByEmail(email);
  const user = rows[0];

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  const password_hash = await hashPassword(newPassword);
  await updateUserPassword(user.id, password_hash);

  console.log(`✅ Password reset for ${user.email} (role: ${user.role}, id: ${user.id})`);
} catch (err) {
  console.error('❌ Reset failed: ' + err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
