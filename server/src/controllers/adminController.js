import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ─── Platform-wide stats ──────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [users, communities, experiences, bookings, revenue] = await Promise.all([
    query(`SELECT
             COUNT(*)                                                                AS total,
             COUNT(*) FILTER (WHERE role = 'tourist')                               AS tourists,
             COUNT(*) FILTER (WHERE role = 'community')                             AS community_owners,
             COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')      AS new_this_month
           FROM users`),
    query(`SELECT
             COUNT(*)                                        AS total,
             COUNT(*) FILTER (WHERE status = 'verified')    AS verified,
             COUNT(*) FILTER (WHERE status = 'pending')     AS pending
           FROM communities`),
    query(`SELECT
             COUNT(*)                                        AS total,
             COUNT(*) FILTER (WHERE status = 'active')      AS active
           FROM experiences`),
    query(`SELECT
             COUNT(*)                                                                 AS total,
             COUNT(*) FILTER (WHERE status = 'completed')                            AS completed,
             COUNT(*) FILTER (WHERE status = 'cancelled')                            AS cancelled,
             COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')       AS this_month
           FROM bookings`),
    query(`SELECT COALESCE(SUM(total_amount), 0) AS total
           FROM bookings
           WHERE status = 'completed'`),
  ]);

  res.json(new ApiResponse(200, {
    users:         users.rows[0],
    communities:   communities.rows[0],
    experiences:   experiences.rows[0],
    bookings:      bookings.rows[0],
    total_revenue: revenue.rows[0].total,
  }));
});

// ─── Booking trend (last 12 months) ──────────────────────────
export const getBookingTrend = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       DATE_TRUNC('month', created_at)::DATE           AS month,
       COUNT(*)                                         AS total_bookings,
       COUNT(*) FILTER (WHERE status = 'completed')    AS completed,
       COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) AS revenue
     FROM bookings
     WHERE created_at >= NOW() - INTERVAL '12 months'
     GROUP BY month
     ORDER BY month ASC`
  );
  res.json(new ApiResponse(200, { trend: result.rows }));
});

// ─── Get all users (paginated, filterable) ────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const offset  = (parseInt(page) - 1) * parseInt(limit);
  const params  = [];
  const filters = [];

  if (role) {
    params.push(role);
    filters.push(`role = $${params.length}`);
  }
  if (status) {
    params.push(status);
    filters.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    // Both columns reference the SAME param index — correct
    const idx = params.length;
    filters.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
  }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const [result, countResult] = await Promise.all([
    query(
      `SELECT id, full_name, email, role, status, avatar_url, phone, created_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    ),
    query(`SELECT COUNT(*) FROM users ${where}`, params),
  ]);

  res.json(new ApiResponse(200, {
    users: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Create a new user (admin only) ─────────────────────────
// Used by admin to create security officer accounts directly.
export const createUser = asyncHandler(async (req, res) => {
  const { full_name, email, password, phone, role = 'security' } = req.body;

  const allowedRoles = ['tourist', 'community', 'security', 'admin'];
  if (!allowedRoles.includes(role)) throw new ApiError(400, 'Invalid role');
  if (!full_name?.trim())  throw new ApiError(400, 'full_name is required');
  if (!email?.trim())      throw new ApiError(400, 'email is required');
  if (!password?.trim())   throw new ApiError(400, 'password is required');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

  // Duplicate e-mail check
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  if (existing.rowCount > 0) throw new ApiError(409, 'A user with that email already exists');

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id, full_name, email, role, status, phone, created_at`,
    [full_name.trim(), email.toLowerCase().trim(), hashedPassword, phone?.trim() ?? null, role]
  );

  // Log the action — schema uses user_id not actor_id
  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'user_role_changed', 'user', $2, $3)`,
    [req.user.id, result.rows[0].id, JSON.stringify({ role, created_by_admin: true })]
  );

  res.status(201).json(new ApiResponse(201, { user: result.rows[0] }, 'User created'));
});

// ─── Update user role or status (admin) ──────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, status, full_name, phone, password } = req.body;

  if (id === req.user.id) throw new ApiError(400, 'Cannot modify your own account via this endpoint');

  const allowedRoles    = ['tourist', 'community', 'security', 'admin'];
  const allowedStatuses = ['active', 'suspended', 'banned'];

  if (role   && !allowedRoles.includes(role))      throw new ApiError(400, 'Invalid role');
  if (status && !allowedStatuses.includes(status)) throw new ApiError(400, 'Invalid status');

  // Build dynamic SET clause
  const setClauses = [];
  const params     = [];

  if (role)      { params.push(role);      setClauses.push(`role = $${params.length}`); }
  if (status)    { params.push(status);    setClauses.push(`status = $${params.length}`); }
  if (full_name) { params.push(full_name); setClauses.push(`full_name = $${params.length}`); }
  if (phone !== undefined) {
    params.push(phone ?? null);
    setClauses.push(`phone = $${params.length}`);
  }
  if (password) {
    if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
    const hash = await bcrypt.hash(password, 12);
    params.push(hash);
    setClauses.push(`password_hash = $${params.length}`);
  }

  if (setClauses.length === 0) throw new ApiError(400, 'Nothing to update');

  params.push(id);
  const result = await query(
    `UPDATE users
     SET ${setClauses.join(', ')}
     WHERE id = $${params.length}
     RETURNING id, full_name, email, role, status, phone`,
    params
  );

  if (!result.rows[0]) throw new ApiError(404, 'User not found');

  // Audit log — schema uses user_id not actor_id
  const action = status ? 'user_status_changed' : role ? 'user_role_changed' : 'user_profile_updated';
  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, 'user', $3, $4)`,
    [req.user.id, action, id, JSON.stringify({ role, status, full_name })]
  );

  res.json(new ApiResponse(200, { user: result.rows[0] }, 'User updated'));
});

// ─── Get activity logs ────────────────────────────────────────
export const getActivityLogs = asyncHandler(async (req, res) => {
  const { action, entity_type, page = 1, limit = 50 } = req.query;
  const offset  = (parseInt(page) - 1) * parseInt(limit);
  const params  = [];
  const filters = [];

  if (action)      { params.push(action);      filters.push(`l.action = $${params.length}`); }
  if (entity_type) { params.push(entity_type); filters.push(`l.entity_type = $${params.length}`); }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const result = await query(
    // Schema uses user_id (not actor_id) for the acting user
    `SELECT l.*, u.full_name AS actor_name, u.email AS actor_email
     FROM activity_logs l
     LEFT JOIN users u ON u.id = l.user_id
     ${where}
     ORDER BY l.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM activity_logs l ${where}`,
    params
  );

  res.json(new ApiResponse(200, {
    logs: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Get analytics data ───────────────────────────────────────
export const getAnalytics = asyncHandler(async (req, res) => {
  const [topCommunities, topExperiences, categoryBreakdown] = await Promise.all([
    query(
      `SELECT c.id, c.name, c.slug, c.state, c.village,
              c.avg_rating, c.total_bookings, c.total_reviews,
              c.cover_image_url, c.logo_url
       FROM communities c
       WHERE c.status = 'verified'
       ORDER BY (c.avg_rating * 0.6 + LEAST(c.total_bookings, 100) * 0.4) DESC
       LIMIT 5`
    ),
    query(
      `SELECT e.id, e.title, e.slug, e.category, e.difficulty,
              e.price_per_person, e.currency, e.avg_rating,
              e.total_bookings, e.total_reviews, e.cover_image_url,
              c.name AS community_name, c.slug AS community_slug
       FROM experiences e
       JOIN communities c ON c.id = e.community_id
       WHERE e.status = 'active' AND c.status = 'verified'
       ORDER BY e.total_bookings DESC
       LIMIT 5`
    ),
    query(
      `SELECT category,
              COUNT(*) AS total,
              ROUND(AVG(avg_rating)::NUMERIC, 2) AS avg_rating
       FROM experiences
       WHERE status = 'active'
       GROUP BY category
       ORDER BY total DESC`
    ),
  ]);

  res.json(new ApiResponse(200, {
    top_communities:    topCommunities.rows,
    top_experiences:    topExperiences.rows,
    category_breakdown: categoryBreakdown.rows,
  }));
});