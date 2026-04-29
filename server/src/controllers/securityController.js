import { query } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendExperienceFlagWarningEmail } from '../services/emailService.js';

// ─── Get all communities (security monitor) ────────────────────
export const getAllCommunities = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.*,
            u.full_name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
     FROM communities c
     JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC`
  );
  res.json(new ApiResponse(200, { communities: result.rows }));
});

// ─── Get communities pending verification ─────────────────────
export const getPendingCommunities = asyncHandler(async (req, res) => {
  const result = await query(
    // FIX: u.name → u.full_name
    `SELECT c.*,
            u.full_name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
     FROM communities c
     JOIN users u ON u.id = c.user_id
     WHERE c.status = 'pending'
     ORDER BY c.created_at ASC`
  );
  res.json(new ApiResponse(200, { communities: result.rows }));
});

// ─── Verify a community ───────────────────────────────────────
export const verifyCommunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  // FIX: communities schema has no verification_note column — store note in rejection_reason
  //      (repurposed as a general review note) or simply drop it. Dropped here to be safe.
  const result = await query(
    `UPDATE communities
     SET status = 'verified', verified_at = NOW(), verified_by = $1
     WHERE id = $2 AND status = 'pending'
     RETURNING id, name, status`,
    [req.user.id, id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Community not found or already processed');

  const ownerResult = await query('SELECT user_id FROM communities WHERE id = $1', [id]);
  if (ownerResult.rows[0]) {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id, action_url)
       VALUES ($1, 'community_verified', 'Community Verified! 🎉',
               'Congratulations! Your community has been verified. You can now create experiences.',
               'community', $2, '/community/dashboard')`,
      [ownerResult.rows[0].user_id, id]
    );
  }

  res.json(new ApiResponse(200, { community: result.rows[0] }, 'Community verified'));
});

// ─── Reject a community ───────────────────────────────────────
export const rejectCommunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  if (!rejection_reason) throw new ApiError(400, 'Rejection reason is required');

  const result = await query(
    // rejection_reason IS a real column in the schema — use it directly
    `UPDATE communities
     SET status = 'rejected', verified_by = $1, rejection_reason = $2
     WHERE id = $3 AND status = 'pending'
     RETURNING id, name, status`,
    [req.user.id, rejection_reason, id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Community not found or already processed');

  const ownerResult = await query('SELECT user_id FROM communities WHERE id = $1', [id]);
  if (ownerResult.rows[0]) {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, entity_type, entity_id)
       VALUES ($1, 'community_rejected', 'Community Application Update',
               $2, 'community', $3)`,
      [ownerResult.rows[0].user_id, `Your community application was not approved: ${rejection_reason}`, id]
    );
  }

  res.json(new ApiResponse(200, { community: result.rows[0] }, 'Community rejected'));
});

// ─── Suspend a user ───────────────────────────────────────────
export const suspendUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) throw new ApiError(400, 'Suspension reason is required');
  if (id === req.user.id) throw new ApiError(400, 'Cannot suspend yourself');

  const check = await query('SELECT role FROM users WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'User not found');
  if (['admin', 'security'].includes(check.rows[0].role)) {
    throw new ApiError(403, 'Cannot suspend admin or security users');
  }

  await query("UPDATE users SET status = 'suspended' WHERE id = $1", [id]);

  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'user_suspended', 'user', $2, $3)`,
    [req.user.id, id, JSON.stringify({ reason })]
  );

  res.json(new ApiResponse(200, null, 'User suspended'));
});

// ─── Unsuspend a user ─────────────────────────────────────────
export const unsuspendUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    "UPDATE users SET status = 'active' WHERE id = $1 AND status = 'suspended' RETURNING id",
    [id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'User not found or not suspended');

  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
     VALUES ($1, 'user_unsuspended', 'user', $2)`,
    [req.user.id, id]
  );

  res.json(new ApiResponse(200, null, 'User reinstated'));
});

// ─── Get suspended users ─────────────────────────────────────
export const getSuspendedUsers = asyncHandler(async (req, res) => {
  const result = await query(
    // FIX: name → full_name
    `SELECT id, full_name, email, role, status, updated_at AS suspended_at
     FROM users
     WHERE status IN ('suspended', 'banned')
     ORDER BY updated_at DESC`
  );
  res.json(new ApiResponse(200, { users: result.rows }));
});

// ─── Get security dashboard stats ────────────────────────────
export const getSecurityStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, activeUsers, flaggedUsers, suspendedUsers,
    totalExps, liveExps, reviewExps, flaggedExps
  ] = await Promise.all([
    query("SELECT COUNT(*) FROM users WHERE role NOT IN ('admin','security')"),
    query("SELECT COUNT(*) FROM users WHERE last_login_at >= NOW() - INTERVAL '24 hours' AND role NOT IN ('admin','security')"),
    query("SELECT COUNT(*) FROM users WHERE status = 'flagged'"),
    query("SELECT COUNT(*) FROM users WHERE status IN ('suspended','banned')"),
    query("SELECT COUNT(*) FROM experiences"),
    query("SELECT COUNT(*) FROM experiences WHERE status = 'active'"),
    query("SELECT COUNT(*) FROM experiences WHERE status = 'pending'"),
    query("SELECT COUNT(*) FROM experiences WHERE status = 'paused'"),
  ]);

  res.json(new ApiResponse(200, {
    // User stats
    total_users:     parseInt(totalUsers.rows[0].count),
    active_today:    parseInt(activeUsers.rows[0].count),
    flagged_users:   parseInt(flaggedUsers.rows[0].count),
    suspended_users: parseInt(suspendedUsers.rows[0].count),
    
    // Experience stats
    total_experiences:   parseInt(totalExps.rows[0].count),
    live_experiences:    parseInt(liveExps.rows[0].count),
    review_experiences:  parseInt(reviewExps.rows[0].count),
    flagged_experiences: parseInt(flaggedExps.rows[0].count),
  }));
});

// ─── Get a single community by ID (security/admin — any status) ─
export const getCommunityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT c.*,
            u.full_name  AS owner_name,
            u.email      AS owner_email,
            u.phone      AS owner_phone,
            u.avatar_url AS owner_avatar
     FROM communities c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = $1`,
    [id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Community not found');
  res.json(new ApiResponse(200, { community: result.rows[0] }));
});

// ─── Get all users (security monitor, with filters) ──────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { status, role, search, page = 1, limit = 50 } = req.query;
  const offset  = (parseInt(page) - 1) * parseInt(limit);
  const params  = [];
  const filters = ["u.role NOT IN ('admin','security')"];

  if (status) { params.push(status); filters.push(`u.status = $${params.length}`); }
  if (role)   { params.push(role);   filters.push(`u.role   = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    filters.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }

  const where = 'WHERE ' + filters.join(' AND ');

  const [result, countRes] = await Promise.all([
    query(
      `SELECT u.id,
              u.full_name  AS name,
              u.email,
              u.avatar_url,
              u.role,
              u.status,
              u.city      AS location,
              u.updated_at AS last_active,
              (SELECT COUNT(*) FROM bookings b WHERE b.tourist_id = u.id)  AS booking_count,
              (SELECT COUNT(*) FROM reports  r WHERE r.reported_by = u.id) AS report_count
       FROM users u
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    ),
    query(`SELECT COUNT(*) FROM users u ${where}`, params),
  ]);

  res.json(new ApiResponse(200, {
    users: result.rows,
    pagination: {
      total: parseInt(countRes.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Flag a user (security) ───────────────────────────────────
export const flagUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason?.trim()) throw new ApiError(400, 'Reason is required');

  const result = await query(
    "UPDATE users SET status = 'flagged' WHERE id = $1 RETURNING id, full_name, status",
    [id]
  );
  if (!result.rows[0]) throw new ApiError(404, 'User not found');

  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'user_flagged', 'user', $2, $3)`,
    [req.user.id, id, JSON.stringify({ reason })]
  );

  res.json(new ApiResponse(200, { user: result.rows[0] }, 'User flagged for review'));
});

// ─── Get all experiences (security monitor, with filters) ─────
export const getAllExperiences = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 50 } = req.query;
  const offset  = (parseInt(page) - 1) * parseInt(limit);
  const params  = [];
  const filters = [];

  // The frontend sends 'live' but DB stores 'active'; map them
  const statusMap = { live: 'active', suspended: 'paused' };
  const dbStatus  = status ? (statusMap[status] ?? status) : null;

  if (dbStatus)  { params.push(dbStatus);  filters.push(`e.status   = $${params.length}`); }
  if (category)  { params.push(category);  filters.push(`e.category = $${params.length}`); }
  if (search)    {
    params.push(`%${search}%`);
    filters.push(`(e.title ILIKE $${params.length} OR c.name ILIKE $${params.length})`);
  }

  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const [result, countRes] = await Promise.all([
    query(
      `SELECT e.id, e.title, e.slug, e.status, e.category,
              e.price_per_person, e.duration_days,
              e.avg_rating, e.total_bookings AS booking_count,
              e.cover_image_url, e.created_at,
              c.name  AS community_name,
              c.state, c.village,
              u.full_name AS host_name,
              (SELECT COUNT(*) FROM reports r
               WHERE r.target_id = e.id
                 AND r.report_type = 'experience'
                 AND r.status = 'open') AS report_count
       FROM experiences e
       JOIN communities c ON c.id = e.community_id
       JOIN users u ON u.id = c.user_id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    ),
    query(
      `SELECT COUNT(*)
       FROM experiences e
       JOIN communities c ON c.id = e.community_id
       ${where}`,
      params
    ),
  ]);

  // Map DB status back to frontend labels
  const reverseMap = { active: 'live', paused: 'suspended', archived: 'suspended' };
  const rows = result.rows.map((r) => ({
    ...r,
    status: reverseMap[r.status] ?? r.status,
  }));

  res.json(new ApiResponse(200, {
    experiences: rows,
    pagination: {
      total: parseInt(countRes.rows[0].count),
      page:  parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Flag an experience ───────────────────────────────────────
export const flagExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason?.trim()) throw new ApiError(400, 'Reason is required');

  const result = await query(
    "UPDATE experiences SET status = 'paused' WHERE id = $1 RETURNING id, title, community_id",
    [id]
  );
  if (!result.rows[0]) throw new ApiError(404, 'Experience not found');

  const exp = result.rows[0];

  // Fetch community owner email
  const ownerResult = await query(
    `SELECT u.email, u.full_name, c.name AS community_name
     FROM communities c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = $1`,
    [exp.community_id]
  );

  if (ownerResult.rows[0]) {
    const owner = ownerResult.rows[0];
    try {
      await sendExperienceFlagWarningEmail(owner.email, {
        ownerName: owner.full_name,
        communityName: owner.community_name,
        experienceTitle: exp.title,
        reason: reason
      });
    } catch (err) {
      console.error('Failed to send flag email', err);
    }
  }

  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'experience_flagged', 'experience', $2, $3)`,
    [req.user.id, id, JSON.stringify({ reason })]
  );

  res.json(new ApiResponse(200, { experience: exp }, 'Experience flagged and owner notified'));
});

// ─── Approve an experience (set to active) ────────────────────
export const approveExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    "UPDATE experiences SET status = 'active' WHERE id = $1 RETURNING id, title, status",
    [id]
  );
  if (!result.rows[0]) throw new ApiError(404, 'Experience not found');

  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
     VALUES ($1, 'experience_approved', 'experience', $2)`,
    [req.user.id, id]
  );

  res.json(new ApiResponse(200, { experience: result.rows[0] }, 'Experience approved'));
});

// ─── Suspend an experience (set to paused) ────────────────────
export const suspendExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason?.trim()) throw new ApiError(400, 'Reason is required');

  const result = await query(
    "UPDATE experiences SET status = 'paused' WHERE id = $1 RETURNING id, title, status",
    [id]
  );
  if (!result.rows[0]) throw new ApiError(404, 'Experience not found');

  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'experience_suspended', 'experience', $2, $3)`,
    [req.user.id, id, JSON.stringify({ reason })]
  );

  res.json(new ApiResponse(200, { experience: result.rows[0] }, 'Experience suspended'));
});