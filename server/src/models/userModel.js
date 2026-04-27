import { query } from '../config/db.js';

// ─── Core user queries ────────────────────────────────────────

export const findUserByEmail = (email) =>
  query(
    `SELECT id, full_name, email, password_hash, role, status, avatar_url,
            phone, bio, country, city, email_verified, last_login
     FROM users WHERE email = $1`,
    [email]
  );

export const findUserById = (id) =>
  query(
    `SELECT id, full_name, email, role, status, avatar_url,
            phone, bio, country, city, email_verified, last_login, created_at
     FROM users WHERE id = $1`,
    [id]
  );

export const findPublicUserById = (id) =>
  query(
    `SELECT id, full_name, avatar_url, bio, country, city, role, created_at
     FROM users WHERE id = $1 AND status = 'active'`,
    [id]
  );

export const createUser = ({ full_name, email, password_hash, role }) =>
  query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, role, status, avatar_url, created_at`,
    [full_name, email, password_hash, role]
  );

export const updateUserLastLogin = (id) =>
  query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [id]);

export const updateUserPassword = (id, password_hash) =>
  query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [password_hash, id]);

export const updateUserProfile = (id, { full_name, phone, bio, country, city }) =>
  query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         phone     = COALESCE($2, phone),
         bio       = COALESCE($3, bio),
         country   = COALESCE($4, country),
         city      = COALESCE($5, city)
     WHERE id = $6
     RETURNING id, full_name, email, phone, bio, country, city, avatar_url, role, status`,
    [full_name, phone, bio, country, city, id]
  );

export const updateUserAvatar = (id, avatar_url) =>
  query(
    `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, avatar_url`,
    [avatar_url, id]
  );

export const updateUserAvatarUrl = (id, avatar_url) =>
  query(
    `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, avatar_url`,
    [avatar_url, id]
  );

export const getAvatarUrl = (id) =>
  query(`SELECT avatar_url FROM users WHERE id = $1`, [id]);

// ─── Admin: paginated user list with filters ──────────────────

export const findUsersAdmin = ({ role, status, search, limit, offset }) => {
  const params = [];
  const filters = [];

  if (role)   { params.push(role);          filters.push(`role = $${params.length}`); }
  if (status) { params.push(status);        filters.push(`status = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    filters.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  return query(
    `SELECT id, full_name, email, role, status, avatar_url, email_verified, last_login, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
};

export const countUsersAdmin = ({ role, status, search }) => {
  const params = [];
  const filters = [];

  if (role)   { params.push(role);          filters.push(`role = $${params.length}`); }
  if (status) { params.push(status);        filters.push(`status = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    filters.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  return query(`SELECT COUNT(*) FROM users ${where}`, params);
};

export const updateUserRoleOrStatus = (id, { role, status }) =>
  query(
    `UPDATE users
     SET role   = COALESCE($1, role),
         status = COALESCE($2, status)
     WHERE id = $3
     RETURNING id, full_name, email, role, status`,
    [role, status, id]
  );

// ─── Suspended / banned users (security) ─────────────────────

export const findSuspendedUsers = () =>
  query(
    `SELECT id, full_name, email, role, status, updated_at AS suspended_at
     FROM users
     WHERE status IN ('suspended', 'banned')
     ORDER BY updated_at DESC`
  );

export const suspendUser = (id) =>
  query(
    `UPDATE users SET status = 'suspended' WHERE id = $1 RETURNING id`,
    [id]
  );

export const unsuspendUser = (id) =>
  query(
    `UPDATE users SET status = 'active'
     WHERE id = $1 AND status = 'suspended'
     RETURNING id`,
    [id]
  );

export const findUserRoleById = (id) =>
  query(`SELECT role, status FROM users WHERE id = $1`, [id]);

// ─── Interests ────────────────────────────────────────────────

export const getUserInterests = (id) =>
  query(`SELECT interests FROM users WHERE id = $1`, [id]);

export const setUserInterests = (id, interests) =>
  query(
    `UPDATE users SET interests = $1 WHERE id = $2 RETURNING interests`,
    [interests, id]
  );

// ─── Favorites ────────────────────────────────────────────────

export const getFavorites = (user_id, target_type) => {
  const params = [user_id];
  let sql = `SELECT id, target_type, target_id, created_at
             FROM favorites WHERE user_id = $1`;
  if (target_type) { params.push(target_type); sql += ` AND target_type = $2`; }
  sql += ' ORDER BY created_at DESC';
  return query(sql, params);
};

export const addFavorite = (user_id, target_type, target_id) =>
  query(
    `INSERT INTO favorites (user_id, target_type, target_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, target_type, target_id) DO NOTHING
     RETURNING *`,
    [user_id, target_type, target_id]
  );

export const removeFavorite = (user_id, target_type, target_id) =>
  query(
    `DELETE FROM favorites
     WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [user_id, target_type, target_id]
  );

// ─── Password reset ───────────────────────────────────────────

export const setResetToken = (email, token_hash, expiry) =>
  query(
    `UPDATE users SET reset_token = $1, reset_token_expiry = $2
     WHERE email = $3 RETURNING id, full_name`,
    [token_hash, expiry, email]
  );

export const findByResetToken = (token_hash) =>
  query(
    `SELECT id FROM users
     WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
    [token_hash]
  );

export const clearResetToken = (id) =>
  query(
    `UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1`,
    [id]
  );

// ─── Email verification ───────────────────────────────────────

export const setVerificationToken = (id, token) =>
  query(
    `UPDATE users SET verification_token = $1 WHERE id = $2`,
    [token, id]
  );

export const verifyEmail = (token) =>
  query(
    `UPDATE users
     SET email_verified = TRUE, verification_token = NULL
     WHERE verification_token = $1
     RETURNING id`,
    [token]
  );
