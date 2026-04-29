import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ─── Get user profile by ID (public) ────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, full_name AS name, username, avatar_url, bio,
            country, city, role, created_at
     FROM users WHERE id = $1 AND status = 'active'`,
    [id]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(404, 'User not found');

  res.json(new ApiResponse(200, { user }));
});

// ─── Update own profile ──────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, phone, bio, country, city } = req.body;

  // Check username uniqueness if provided
  if (username) {
    const taken = await query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, req.user.id]
    );
    if (taken.rowCount > 0) throw new ApiError(409, 'Username already taken');
  }

  const result = await query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         username  = COALESCE($2, username),
         phone     = COALESCE($3, phone),
         bio       = COALESCE($4, bio),
         country   = COALESCE($5, country),
         city      = COALESCE($6, city),
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, full_name AS name, username, email, phone, bio,
               country, city, avatar_url, role, status`,
    [name, username || null, phone || null, bio, country, city, req.user.id]
  );

  res.json(new ApiResponse(200, { user: result.rows[0] }, 'Profile updated'));
});

// ─── Upload / update avatar ──────────────────────────────────
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided');

  const existing = await query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id]);
  const oldUrl = existing.rows[0]?.avatar_url;
  if (oldUrl) {
    const publicId = extractPublicId(oldUrl);
    if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
  }

  const uploaded = await uploadToCloudinary(req.file.buffer, 'avatars', {
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  });

  const result = await query(
    'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, avatar_url',
    [uploaded.secure_url, req.user.id]
  );

  res.json(new ApiResponse(200, { user: result.rows[0] }, 'Avatar updated'));
});

// ─── Get tourist interests ───────────────────────────────────
export const getInterests = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT interests FROM users WHERE id = $1',
    [req.user.id]
  );
  res.json(new ApiResponse(200, { interests: result.rows[0]?.interests || [] }));
});

// ─── Update tourist interests ────────────────────────────────
export const updateInterests = asyncHandler(async (req, res) => {
  const { interests } = req.body;
  if (!Array.isArray(interests)) throw new ApiError(400, 'Interests must be an array');

  const result = await query(
    'UPDATE users SET interests = $1, updated_at = NOW() WHERE id = $2 RETURNING interests',
    [interests, req.user.id]
  );
  res.json(new ApiResponse(200, { interests: result.rows[0].interests }, 'Interests updated'));
});

// ─── Get favorites ───────────────────────────────────────────
export const getFavorites = asyncHandler(async (req, res) => {
  const { type } = req.query;

  let sql = `
    SELECT
      f.id,
      f.target_type,
      f.target_id,
      f.created_at,
      CASE
        WHEN f.target_type = 'experience' THEN e.slug
        WHEN f.target_type = 'community'  THEN c.slug
      END AS slug,
      CASE
        WHEN f.target_type = 'experience' THEN e.title
        WHEN f.target_type = 'community'  THEN c.name
      END AS name,
      CASE
        WHEN f.target_type = 'experience' THEN e.meeting_point
        WHEN f.target_type = 'community'  THEN c.village
      END AS location,
      CASE
        WHEN f.target_type = 'experience' THEN e.short_description
        WHEN f.target_type = 'community'  THEN c.short_description
      END AS description,
      CASE
        WHEN f.target_type = 'experience' THEN e.avg_rating::text
        WHEN f.target_type = 'community'  THEN c.avg_rating::text
      END AS rating,
      CASE
        WHEN f.target_type = 'experience' THEN e.cover_image_url
        WHEN f.target_type = 'community'  THEN c.cover_image_url
      END AS cover_image_url
    FROM favorites f
    LEFT JOIN experiences e
      ON f.target_type = 'experience' AND f.target_id = e.id
    LEFT JOIN communities c
      ON f.target_type = 'community'  AND f.target_id = c.id
    WHERE f.user_id = $1
  `;
  const params = [req.user.id];

  if (type) {
    sql += ' AND f.target_type = $2';
    params.push(type);
  }

  sql += ' ORDER BY f.created_at DESC';

  const result = await query(sql, params);
  res.json(new ApiResponse(200, { favorites: result.rows }));
});

// ─── Add favorite ────────────────────────────────────────────
export const addFavorite = asyncHandler(async (req, res) => {
  const { target_type, target_id } = req.body;

  if (!['experience', 'community'].includes(target_type)) {
    throw new ApiError(400, 'Invalid target_type');
  }

  const result = await query(
    `INSERT INTO favorites (user_id, target_type, target_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, target_type, target_id) DO NOTHING
     RETURNING *`,
    [req.user.id, target_type, target_id]
  );

  res.status(201).json(new ApiResponse(201, { favorite: result.rows[0] }, 'Added to favorites'));
});

// ─── Remove favorite ─────────────────────────────────────────
export const removeFavorite = asyncHandler(async (req, res) => {
  const { target_type, target_id } = req.params;

  await query(
    'DELETE FROM favorites WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
    [req.user.id, target_type, target_id]
  );

  res.json(new ApiResponse(200, null, 'Removed from favorites'));
});