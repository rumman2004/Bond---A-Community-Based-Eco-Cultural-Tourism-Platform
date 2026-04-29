import { query, getClient } from '../config/db.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const attachExperienceImages = async (experiences) => {
  if (!experiences?.length) return experiences;
  try {
    const ids = experiences.map((experience) => experience.id);
    const imagesResult = await query(
      `SELECT id, experience_id, image_url, image_public_id, caption, sort_order, is_primary, created_at
       FROM experience_images
       WHERE experience_id = ANY($1)
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [ids]
    );
    const byExperience = new Map();
    imagesResult.rows.forEach((image) => {
      if (!byExperience.has(image.experience_id)) byExperience.set(image.experience_id, []);
      byExperience.get(image.experience_id).push(image);
    });
    experiences.forEach((experience) => {
      experience.images = byExperience.get(experience.id) || [];
    });
  } catch (err) {
    if (err.code !== '42P01') throw err;
    experiences.forEach((experience) => {
      experience.images = [];
    });
  }
  return experiences;
};

// ─── Get all active experiences (public, explore page) ───────
export const getExperiences = asyncHandler(async (req, res) => {
  const {
    community_id, category, difficulty, state,
    min_price, max_price, tag, search,
    page = 1, limit = 12,
    sort = 'popularity_score',
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const filters = ["e.status = 'active'", "c.status = 'verified'"];

  if (community_id) { params.push(community_id); filters.push(`e.community_id = $${params.length}`); }
  if (category)     { params.push(category);     filters.push(`e.category = $${params.length}`); }
  if (difficulty)   { params.push(difficulty);   filters.push(`e.difficulty = $${params.length}`); }
  if (state)        { params.push(state);        filters.push(`c.state = $${params.length}`); }
  if (min_price)    { params.push(min_price);    filters.push(`e.price_per_person >= $${params.length}`); }
  if (max_price)    { params.push(max_price);    filters.push(`e.price_per_person <= $${params.length}`); }
  if (tag)          { params.push(tag);          filters.push(`$${params.length} = ANY(e.sustainability_tags)`); }
  if (search)       { params.push(`%${search}%`); filters.push(`e.title ILIKE $${params.length}`); }

  const where = filters.join(' AND ');

  // Inline sort — no external view needed
  const allowedSorts = {
    popularity_score: { col: 'e.total_bookings', dir: 'DESC' },
    rating:           { col: 'e.avg_rating',     dir: 'DESC' },
    price_asc:        { col: 'e.price_per_person', dir: 'ASC' },
    price_desc:       { col: 'e.price_per_person', dir: 'DESC' },
    newest:           { col: 'e.created_at',     dir: 'DESC' },
  };
  const { col: orderCol, dir: orderDir } =
    allowedSorts[sort] || allowedSorts.popularity_score;

  const countResult = await query(
    `SELECT COUNT(*)
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  params.push(parseInt(limit), offset);

  // Direct query on experiences — replaces missing popular_experiences view
  const result = await query(
    `SELECT e.*,
            c.name    AS community_name,
            c.slug    AS community_slug,
            c.village, c.district, c.state AS community_state,
            c.logo_url AS community_logo
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE ${where}
     ORDER BY ${orderCol} ${orderDir}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  await attachExperienceImages(result.rows);

  res.setHeader('X-Total-Count', total);
  res.json(new ApiResponse(200, {
    experiences: result.rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  }));
});

// ─── Get single experience by slug (public) ──────────────────
export const getExperienceBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await query(
    `SELECT e.*,
            c.name     AS community_name,
            c.slug     AS community_slug,
            c.village, c.district, c.state,
            c.logo_url AS community_logo
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.slug = $1 AND e.status = 'active'`,
    [slug]
  );

  const experience = result.rows[0];
  if (!experience) throw new ApiError(404, 'Experience not found');

  // Tags
  const tagsResult = await query(
    `SELECT st.slug, st.label, st.icon
     FROM experience_sustainability_tags est
     JOIN sustainability_tags st ON st.id = est.tag_id
     WHERE est.experience_id = $1`,
    [experience.id]
  );
  experience.tags = tagsResult.rows;

  // Latest 5 reviews — fixed u.name → u.full_name
  const reviewsResult = await query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at,
            u.full_name  AS tourist_name,
            u.avatar_url AS tourist_avatar
     FROM reviews r
     JOIN users u ON u.id = r.tourist_id
     WHERE r.experience_id = $1 AND r.is_visible = TRUE
     ORDER BY r.created_at DESC LIMIT 5`,
    [experience.id]
  );
  experience.recent_reviews = reviewsResult.rows;
  await attachExperienceImages([experience]);

  res.json(new ApiResponse(200, { experience }));
});

// ─── Create experience (community owner) ─────────────────────
export const createExperience = asyncHandler(async (req, res) => {
  const commResult = await query(
    "SELECT id FROM communities WHERE user_id = $1 AND status = 'verified'",
    [req.user.id]
  );
  if (!commResult.rows[0]) throw new ApiError(403, 'Verified community required to create experiences');
  const communityId = commResult.rows[0].id;

  const {
    title, slug, description, short_description,
    category, difficulty, duration_hours, duration_days,
    max_group_size, min_group_size,
    price_per_person, currency,
    includes, excludes, meeting_point, languages_offered,
  } = req.body;

  const slugCheck = await query('SELECT id FROM experiences WHERE slug = $1', [slug]);
  if (slugCheck.rowCount > 0) throw new ApiError(409, 'Slug already taken');

  const result = await query(
    `INSERT INTO experiences
       (community_id, title, slug, description, short_description,
        category, difficulty, duration_hours, duration_days,
        max_group_size, min_group_size,
        price_per_person, currency,
        includes, excludes, meeting_point, languages_offered)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [
      communityId, title, slug, description, short_description,
      category, difficulty, duration_hours, duration_days,
      max_group_size, min_group_size,
      price_per_person, currency || 'INR',
      includes, excludes, meeting_point, languages_offered,
    ]
  );

  res.status(201).json(new ApiResponse(201, { experience: result.rows[0] }, 'Experience created'));
});

// ─── Update experience ───────────────────────────────────────
export const updateExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const check = await query(
    `SELECT e.id FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.id = $1 AND c.user_id = $2`,
    [id, req.user.id]
  );
  if (!check.rows[0]) throw new ApiError(403, 'Not authorized or experience not found');

  const {
    title, description, short_description, category, difficulty,
    duration_hours, duration_days,
    max_group_size, min_group_size,
    price_per_person,
    includes, excludes,
    meeting_point, languages_offered, status,
  } = req.body;

  const allowedStatuses = ['draft', 'active', 'paused', 'archived'];
  if (status && !allowedStatuses.includes(status)) throw new ApiError(400, 'Invalid status');

  const result = await query(
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
    [
      title, description, short_description, category, difficulty,
      duration_hours, duration_days,
      max_group_size, min_group_size,
      price_per_person, includes, excludes,
      meeting_point, languages_offered, status,
      id,
    ]
  );

  res.json(new ApiResponse(200, { experience: result.rows[0] }, 'Experience updated'));
});

// ─── Upload cover image ──────────────────────────────────────
export const updateExperienceCover = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) throw new ApiError(400, 'No image provided');

  const check = await query(
    `SELECT e.id, e.cover_image_url FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.id = $1 AND c.user_id = $2`,
    [id, req.user.id]
  );
  if (!check.rows[0]) throw new ApiError(403, 'Not authorized or experience not found');

  const oldUrl = check.rows[0].cover_image_url;
  if (oldUrl) {
    const pid = extractPublicId(oldUrl);
    if (pid) await deleteFromCloudinary(pid).catch(() => {});
  }

  const uploaded = await uploadToCloudinary(req.file.buffer, 'experiences/covers', {
    transformation: [{ width: 1200, height: 675, crop: 'fill' }],
  });

  const result = await query(
    'UPDATE experiences SET cover_image_url = $1 WHERE id = $2 RETURNING id, cover_image_url',
    [uploaded.secure_url, id]
  );

  res.json(new ApiResponse(200, { experience: result.rows[0] }, 'Cover image updated'));
});

// ─── Upload multiple experience images ───────────────────────
export const uploadExperienceImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.files?.length) throw new ApiError(400, 'No images provided');

  const check = await query(
    `SELECT e.id
     FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.id = $1 AND c.user_id = $2`,
    [id, req.user.id]
  );
  if (!check.rows[0]) throw new ApiError(403, 'Not authorized or experience not found');

  const existingResult = await query(
    'SELECT COUNT(*) FROM experience_images WHERE experience_id = $1',
    [id]
  );
  const existing = Number(existingResult.rows[0]?.count || 0);
  if (existing + req.files.length > 5) {
    throw new ApiError(400, `Maximum 5 experience images allowed (already has ${existing})`);
  }

  const uploads = await Promise.all(
    req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'experiences/covers', {
        transformation: [{ width: 1200, height: 675, crop: 'fill' }],
      })
    )
  );

  const insertedImages = [];
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < uploads.length; i += 1) {
      const isPrimary = existing === 0 && i === 0;
      const imageResult = await client.query(
        `INSERT INTO experience_images
           (experience_id, image_url, image_public_id, caption, sort_order, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, uploads[i].secure_url, uploads[i].public_id, req.body.caption || null, existing + i, isPrimary]
      );
      insertedImages.push(imageResult.rows[0]);
    }

    await client.query(
      `UPDATE experiences
       SET cover_image_url = COALESCE(cover_image_url, $1)
       WHERE id = $2`,
      [uploads[0].secure_url, id]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.status(201).json(new ApiResponse(201, { images: insertedImages }, 'Experience images uploaded'));
});

// ─── Delete experience (soft archive) ───────────────────────
export const deleteExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const check = await query(
    `SELECT e.id FROM experiences e
     JOIN communities c ON c.id = e.community_id
     WHERE e.id = $1 AND c.user_id = $2`,
    [id, req.user.id]
  );
  if (!check.rows[0]) throw new ApiError(403, 'Not authorized or experience not found');

  await query("UPDATE experiences SET status = 'archived' WHERE id = $1", [id]);
  res.json(new ApiResponse(200, null, 'Experience archived'));
});
