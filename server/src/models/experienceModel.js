import { query, getClient } from '../config/db.js';

// ─── Public queries ───────────────────────────────────────────

/**
 * Paginated list via popular_experiences view.
 * Filters applied on base tables (e, c), ordering from the view.
 */
export const findExperiences = ({
  community_id, category, difficulty, state,
  min_price, max_price, tag, search,
  sort, limit, offset,
}) => {
  const params = [];
  const filters = ["e.status = 'active'", "c.status = 'verified'"];

  if (community_id) { params.push(community_id); filters.push(`e.community_id = $${params.length}`); }
  if (category)     { params.push(category);     filters.push(`e.category = $${params.length}`); }
  if (difficulty)   { params.push(difficulty);   filters.push(`e.difficulty = $${params.length}`); }
  if (state)        { params.push(state);         filters.push(`c.state = $${params.length}`); }
  if (min_price)    { params.push(min_price);     filters.push(`e.price_per_person >= $${params.length}`); }
  if (max_price)    { params.push(max_price);     filters.push(`e.price_per_person <= $${params.length}`); }
  if (tag)          { params.push(tag);           filters.push(`$${params.length} = ANY(e.sustainability_tags)`); }
  if (search)       { params.push(`%${search}%`); filters.push(`e.title ILIKE $${params.length}`); }

  const where = filters.join(' AND ');

  const allowedSorts = {
    popularity_score: 'pe.popularity_score DESC',
    rating:           'e.avg_rating DESC',
    price_asc:        'e.price_per_person ASC',
    price_desc:       'e.price_per_person DESC',
    newest:           'e.created_at DESC',
  };
  const orderBy = allowedSorts[sort] || 'pe.popularity_score DESC';

  params.push(limit, offset);

  return query(
    `SELECT pe.*
     FROM popular_experiences pe
     JOIN experiences e ON e.id = pe.id
     JOIN communities c ON c.id = e.community_id
     WHERE ${where}
     ORDER BY ${orderBy}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
};

export const countExperiences = ({ community_id, category, difficulty, state, min_price, max_price, tag, search }) => {
  const params = [];
  const filters = ["e.status = 'active'", "c.status = 'verified'"];

  if (community_id) { params.push(community_id); filters.push(`e.community_id = $${params.length}`); }
  if (category)     { params.push(category);     filters.push(`e.category = $${params.length}`); }
  if (difficulty)   { params.push(difficulty);   filters.push(`e.difficulty = $${params.length}`); }
  if (state)        { params.push(state);         filters.push(`c.state = $${params.length}`); }
  if (min_price)    { params.push(min_price);     filters.push(`e.price_per_person >= $${params.length}`); }
  if (max_price)    { params.push(max_price);     filters.push(`e.price_per_person <= $${params.length}`); }
  if (tag)          { params.push(tag);           filters.push(`$${params.length} = ANY(e.sustainability_tags)`); }
  if (search)       { params.push(`%${search}%`); filters.push(`e.title ILIKE $${params.length}`); }

  return query(
    `SELECT COUNT(*) FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE ${filters.join(' AND ')}`,
    params
  );
};

export const findExperienceBySlug = (slug) =>
  query(
    `SELECT e.*,
            c.name AS community_name, c.slug AS community_slug,
            c.village, c.district, c.state,
            c.logo_url AS community_logo
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.slug = $1 AND e.status = 'active'`,
    [slug]
  );

export const findExperienceById = (id) =>
  query(
    `SELECT e.*,
            c.name AS community_name, c.status AS community_status,
            c.user_id AS community_owner_id
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.id = $1`,
    [id]
  );

// ─── Community owner management ──────────────────────────────

/** Returns the experience only if it belongs to the given user's community */
export const findExperienceByIdAndOwner = (id, user_id) =>
  query(
    `SELECT e.id, e.cover_image_url FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.id = $1 AND c.user_id = $2`,
    [id, user_id]
  );

export const findExperiencesByOwner = (user_id) =>
  query(
    `SELECT e.id, e.title, e.slug, e.category, e.status,
            e.price_per_person, e.avg_rating, e.total_bookings, e.created_at
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE c.user_id = $1
     ORDER BY e.created_at DESC`,
    [user_id]
  );

export const createExperience = ({
  community_id, title, slug, description, short_description,
  category, difficulty, duration_hours, duration_days,
  max_group_size, min_group_size, price_per_person, currency,
  includes, excludes, meeting_point,
  latitude, longitude, languages_offered,
}) =>
  query(
    `INSERT INTO experiences
       (community_id, title, slug, description, short_description,
        category, difficulty, duration_hours, duration_days,
        max_group_size, min_group_size, price_per_person, currency,
        includes, excludes, meeting_point, languages_offered)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [community_id, title, slug, description, short_description,
     category, difficulty, duration_hours, duration_days,
     max_group_size, min_group_size, price_per_person, currency || 'INR',
     includes, excludes, meeting_point, languages_offered]
  );

export const updateExperience = (id, fields) => {
  const {
    title, description, short_description, category, difficulty,
    duration_hours, duration_days, max_group_size, min_group_size,
    price_per_person, includes, excludes,
    meeting_point, languages_offered, status,
  } = fields;

  return query(
    `UPDATE experiences SET
       title             = COALESCE($1,  title),
       description       = COALESCE($2,  description),
       short_description = COALESCE($3,  short_description),
       category          = COALESCE($4,  category),
       difficulty        = COALESCE($5,  difficulty),
       duration_hours    = COALESCE($6,  duration_hours),
       duration_days     = COALESCE($7,  duration_days),
       max_group_size    = COALESCE($8,  max_group_size),
       min_group_size    = COALESCE($9,  min_group_size),
       price_per_person  = COALESCE($10, price_per_person),
       includes          = COALESCE($11, includes),
       excludes          = COALESCE($12, excludes),
       meeting_point     = COALESCE($13, meeting_point),
       languages_offered = COALESCE($14, languages_offered),
       status            = COALESCE($15, status)
     WHERE id = $16
     RETURNING *`,
    [title, description, short_description, category, difficulty,
     duration_hours, duration_days, max_group_size, min_group_size,
     price_per_person, includes, excludes,
     meeting_point, languages_offered, status, id]
  );
};

export const archiveExperience = (id) =>
  query(`UPDATE experiences SET status = 'archived' WHERE id = $1`, [id]);

export const updateExperienceCoverImage = (id, cover_image_url) =>
  query(
    `UPDATE experiences SET cover_image_url = $1 WHERE id = $2
     RETURNING id, cover_image_url`,
    [cover_image_url, id]
  );

// ─── Sustainability tags ──────────────────────────────────────

export const getExperienceTags = (experience_id) =>
  query(
    `SELECT st.id, st.slug, st.label, st.icon
     FROM experience_sustainability_tags est
     JOIN sustainability_tags st ON st.id = est.tag_id
     WHERE est.experience_id = $1`,
    [experience_id]
  );

export const setExperienceTags = async (experience_id, tag_ids) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM experience_sustainability_tags WHERE experience_id = $1`,
      [experience_id]
    );
    if (tag_ids?.length > 0) {
      const values = tag_ids.map((tid, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO experience_sustainability_tags (experience_id, tag_id) VALUES ${values}`,
        [experience_id, ...tag_ids]
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

// ─── Recent reviews for experience detail page ────────────────

export const getRecentExperienceReviews = (experience_id, limit = 5) =>
  query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at,
            u.full_name AS tourist_name, u.avatar_url AS tourist_avatar
     FROM reviews r
     JOIN users u ON u.id = r.tourist_id
     WHERE r.experience_id = $1 AND r.is_visible = TRUE
     ORDER BY r.created_at DESC LIMIT $2`,
    [experience_id, limit]
  );

// ─── Slug check ───────────────────────────────────────────────

export const checkSlugExists = (slug) =>
  query(`SELECT id FROM experiences WHERE slug = $1`, [slug]);

// ─── Admin stats ──────────────────────────────────────────────

export const countExperiencesByStatus = () =>
  query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'active')   AS active,
       COUNT(*) FILTER (WHERE status = 'draft')    AS draft,
       COUNT(*) FILTER (WHERE status = 'archived') AS archived
     FROM experiences`
  );
