import { query, getClient } from '../config/db.js';

// ─── Public queries ───────────────────────────────────────────

/**
 * Paginated list of verified communities via top_communities view.
 * Filters are applied on the base `communities` table (aliased c)
 * and joined to the view for the ranking fields.
 */
export const findCommunities = ({ state, tag, search, sort, limit, offset }) => {
  const params = [];
  const filters = ["c.status = 'verified'"];

  if (state) { params.push(state); filters.push(`c.state = $${params.length}`); }
  if (tag)   { params.push(tag);   filters.push(`$${params.length} = ANY(c.sustainability_tags)`); }
  if (search) {
    params.push(`%${search}%`);
    filters.push(`(c.name ILIKE $${params.length} OR c.short_description ILIKE $${params.length})`);
  }

  const where = filters.join(' AND ');

  const allowedSorts = {
    community_score: 'tc.community_score',
    rating:          'c.avg_rating',
    bookings:        'c.total_bookings',
  };
  const orderBy = allowedSorts[sort] || 'tc.community_score';

  params.push(limit, offset);

  return query(
    `SELECT tc.*
     FROM top_communities tc
     JOIN communities c ON c.id = tc.id
     WHERE ${where}
     ORDER BY ${orderBy} DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
};

export const countCommunities = ({ state, tag, search }) => {
  const params = [];
  const filters = ["status = 'verified'"];

  if (state) { params.push(state); filters.push(`state = $${params.length}`); }
  if (tag)   { params.push(tag);   filters.push(`$${params.length} = ANY(sustainability_tags)`); }
  if (search) {
    params.push(`%${search}%`);
    filters.push(`(name ILIKE $${params.length} OR short_description ILIKE $${params.length})`);
  }

  return query(`SELECT COUNT(*) FROM communities WHERE ${filters.join(' AND ')}`, params);
};

// FIX: Was u.full_name — standardised to u.name to match all controller queries
export const findCommunityBySlug = (slug) =>
  query(
    `SELECT c.*, u.name AS owner_name, u.avatar_url AS owner_avatar
     FROM communities c
     JOIN users u ON u.id = c.user_id
     WHERE c.slug = $1 AND c.status = 'verified'`,
    [slug]
  );

export const findCommunityById = (id) =>
  query(`SELECT * FROM communities WHERE id = $1`, [id]);

// ─── Ownership lookups ────────────────────────────────────────

export const findCommunityByUserId = (user_id) =>
  query(`SELECT * FROM communities WHERE user_id = $1`, [user_id]);

export const findCommunityIdByUserId = (user_id) =>
  query(`SELECT id FROM communities WHERE user_id = $1`, [user_id]);

export const findVerifiedCommunityByUserId = (user_id) =>
  query(
    `SELECT id, name, slug FROM communities WHERE user_id = $1 AND status = 'verified'`,
    [user_id]
  );

export const findCommunityOwner = (community_id) =>
  query(`SELECT user_id FROM communities WHERE id = $1`, [community_id]);

// ─── Create & update ─────────────────────────────────────────

export const createCommunity = ({
  user_id, name, slug, description, short_description,
  village, district, state, country, pincode, latitude, longitude,
  languages_spoken, best_visit_season,
}) =>
  query(
    `INSERT INTO communities
       (user_id, name, slug, description, short_description,
        village, district, state, country, pincode, latitude, longitude,
        languages_spoken, best_visit_season)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [user_id, name, slug, description, short_description,
     village, district, state, country, pincode, latitude, longitude,
     languages_spoken, best_visit_season]
  );

export const updateCommunity = (id, fields) => {
  const {
    name, description, short_description,
    village, district, state, country, pincode, latitude, longitude,
    languages_spoken, best_visit_season,
  } = fields;

  return query(
    `UPDATE communities SET
       name              = COALESCE($1,  name),
       description       = COALESCE($2,  description),
       short_description = COALESCE($3,  short_description),
       village           = COALESCE($4,  village),
       district          = COALESCE($5,  district),
       state             = COALESCE($6,  state),
       country           = COALESCE($7,  country),
       pincode           = COALESCE($8,  pincode),
       latitude          = COALESCE($9,  latitude),
       longitude         = COALESCE($10, longitude),
       languages_spoken  = COALESCE($11, languages_spoken),
       best_visit_season = COALESCE($12, best_visit_season)
     WHERE id = $13
     RETURNING *`,
    [name, description, short_description, village, district, state, country,
     pincode, latitude, longitude, languages_spoken, best_visit_season, id]
  );
};

export const updateCoverImage = (id, cover_image_url) =>
  query(
    `UPDATE communities SET cover_image_url = $1 WHERE id = $2
     RETURNING id, cover_image_url`,
    [cover_image_url, id]
  );

export const updateLogoUrl = (id, logo_url) =>
  query(
    `UPDATE communities SET logo_url = $1 WHERE id = $2 RETURNING id, logo_url`,
    [logo_url, id]
  );

export const getCoverImageUrl = (id) =>
  query(`SELECT user_id, cover_image_url FROM communities WHERE id = $1`, [id]);

// ─── Sustainability tags ──────────────────────────────────────

export const getTagsByIds = (ids) =>
  query(
    `SELECT * FROM sustainability_tags WHERE id = ANY($1)`,
    [ids]
  );

export const getAllTags = () =>
  query(`SELECT id, slug, label, description, icon FROM sustainability_tags ORDER BY label`);

export const setCommunityTags = async (community_id, tag_ids) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM community_sustainability_tags WHERE community_id = $1`,
      [community_id]
    );
    if (tag_ids?.length > 0) {
      const values = tag_ids.map((tid, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO community_sustainability_tags (community_id, tag_id) VALUES ${values}`,
        [community_id, ...tag_ids]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const getCommunityTags = (community_id) =>
  query(
    `SELECT st.id, st.slug, st.label, st.icon
     FROM community_sustainability_tags cst
     JOIN sustainability_tags st ON st.id = cst.tag_id
     WHERE cst.community_id = $1`,
    [community_id]
  );

// ─── Verification (security team) ────────────────────────────

// FIX: Was u.full_name — standardised to u.name to match controllers
export const findPendingCommunities = () =>
  query(
    `SELECT c.*, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
     FROM communities c
     JOIN users u ON u.id = c.user_id
     WHERE c.status = 'pending'
     ORDER BY c.created_at ASC`
  );

export const verifyCommunity = (id, verified_by, note) =>
  query(
    `UPDATE communities
     SET status = 'verified', verified_at = NOW(), verified_by = $1, rejection_reason = $2
     WHERE id = $3 AND status = 'pending'
     RETURNING id, name, status`,
    [verified_by, note, id]
  );

export const rejectCommunity = (id, verified_by, rejection_reason) =>
  query(
    `UPDATE communities
     SET status = 'rejected', verified_by = $1, rejection_reason = $2
     WHERE id = $3 AND status = 'pending'
     RETURNING id, name, status`,
    [verified_by, rejection_reason, id]
  );

export const suspendCommunity = (id) =>
  query(
    `UPDATE communities SET status = 'suspended' WHERE id = $1 RETURNING id`,
    [id]
  );

// ─── Stats & dashboard ────────────────────────────────────────

export const getCommunityStats = (community_id) =>
  query(
    `SELECT * FROM booking_summary_current_month WHERE community_id = $1`,
    [community_id]
  );

// FIX: Was u.full_name — standardised to u.name to match controllers
export const getCommunityRecentBookings = (community_id) =>
  query(
    `SELECT b.id, b.booking_date, b.num_guests, b.total_amount, b.status,
            u.name AS tourist_name, u.avatar_url AS tourist_avatar,
            e.title AS experience_title
     FROM bookings b
     JOIN users u ON u.id = b.tourist_id
     JOIN experiences e ON e.id = b.experience_id
     WHERE b.community_id = $1
     ORDER BY b.created_at DESC LIMIT 5`,
    [community_id]
  );

// ─── Admin overview ───────────────────────────────────────────

export const countCommunitiesByStatus = () =>
  query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'verified')  AS verified,
       COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
       COUNT(*) FILTER (WHERE status = 'suspended') AS suspended
     FROM communities`
  );

export const checkSlugExists = (slug) =>
  query(`SELECT id FROM communities WHERE slug = $1`, [slug]);