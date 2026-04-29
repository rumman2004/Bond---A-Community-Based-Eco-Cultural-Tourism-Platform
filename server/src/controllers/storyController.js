import { query } from '../config/db.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ─── Get published stories (public) ──────────────────────────
export const getStories = asyncHandler(async (req, res) => {
  const { community_id, community_slug, tag, search, featured, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const filters = ["s.status = 'published'"];

  if (community_id) { params.push(community_id); filters.push(`s.community_id = $${params.length}`); }
  if (community_slug) { params.push(community_slug); filters.push(`c.slug = $${params.length}`); }
  if (tag)          { params.push(tag);          filters.push(`$${params.length} = ANY(s.tags)`); }
  if (featured === 'true') filters.push('s.is_featured = TRUE');
  if (search)       { params.push(`%${search}%`); filters.push(`s.title ILIKE $${params.length}`); }

  const where = filters.join(' AND ');

  // FIX: Was s.views — schema column is view_count
  const result = await query(
    `SELECT s.id, s.title, s.slug, s.excerpt, s.cover_image_url,
            s.tags, s.view_count, s.published_at,
            c.name AS community_name, c.slug AS community_slug,
            c.village, c.state,
            u.username AS author_name, u.avatar_url AS author_avatar
     FROM stories s
     JOIN communities c ON c.id = s.community_id
     JOIN users u ON u.id = s.author_id
     WHERE ${where}
     ORDER BY s.published_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM stories s
     JOIN communities c ON c.id = s.community_id
     WHERE ${where}`,
    params
  );

  res.json(new ApiResponse(200, {
    stories: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    },
  }));
});

// ─── Get story by slug (public) ──────────────────────────────
export const getStoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const result = await query(
    `SELECT s.*,
            c.name AS community_name, c.slug AS community_slug,
            c.logo_url AS community_logo, c.village, c.state,
            u.username AS author_name, u.avatar_url AS author_avatar
     FROM stories s
     JOIN communities c ON c.id = s.community_id
     JOIN users u ON u.id = s.author_id
     WHERE s.slug = $1 AND s.status = 'published'`,
    [slug]
  );

  const story = result.rows[0];
  if (!story) throw new ApiError(404, 'Story not found');

  // FIX: Was views — schema column is view_count
  query('UPDATE stories SET view_count = view_count + 1 WHERE id = $1', [story.id]).catch(() => {});

  res.json(new ApiResponse(200, { story }));
});

// ─── Get stories for community dashboard (community owner) ───
export const getMyCommunityStories = asyncHandler(async (req, res) => {
  const commResult = await query('SELECT id FROM communities WHERE user_id = $1', [req.user.id]);
  if (!commResult.rows[0]) throw new ApiError(404, 'Community not found');

  // FIX: Was views — schema column is view_count, added cover_image_url
  const result = await query(
    `SELECT id, title, slug, status, view_count, published_at, created_at,
            cover_image_url, cover_image_url AS cover_url
     FROM stories WHERE community_id = $1 ORDER BY created_at DESC`,
    [commResult.rows[0].id]
  );

  res.json(new ApiResponse(200, { stories: result.rows }));
});

// ─── Create story ────────────────────────────────────────────
export const createStory = asyncHandler(async (req, res) => {
  const commResult = await query(
    "SELECT id FROM communities WHERE user_id = $1 AND status = 'verified'",
    [req.user.id]
  );
  if (!commResult.rows[0]) throw new ApiError(403, 'Verified community required');
  const communityId = commResult.rows[0].id;

  const { title, slug, body, content, excerpt, tags, cover_url, cover_image_url } = req.body;
  const imgUrl = cover_url || cover_image_url || null;
  
  const realBody = body || content || '';
  let realSlug = slug || title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!realSlug) {
    realSlug = `story-${Date.now()}`;
  }

  const slugCheck = await query('SELECT id FROM stories WHERE slug = $1', [realSlug]);
  if (slugCheck.rowCount > 0) {
    realSlug = `${realSlug}-${Date.now()}`;
  }

  const result = await query(
    `INSERT INTO stories (community_id, author_id, title, slug, body, excerpt, tags, status, published_at, cover_image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'published', NOW(), $8)
     RETURNING *`,
    [communityId, req.user.id, title, realSlug, realBody, excerpt, tags, imgUrl]
  );

  res.status(201).json(new ApiResponse(201, { story: result.rows[0] }, 'Story created'));
});

// ─── Update story ────────────────────────────────────────────
export const updateStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const check = await query('SELECT author_id FROM stories WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'Story not found');
  if (check.rows[0].author_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  const { title, body, content, excerpt, tags, status, cover_url, cover_image_url } = req.body;
  const imgUrl = cover_url || cover_image_url;
  const allowedStatuses = ['draft', 'published', 'archived'];
  if (status && !allowedStatuses.includes(status)) throw new ApiError(400, 'Invalid status');

  const realBody = body !== undefined ? body : content;

  const result = await query(
    `UPDATE stories SET
       title            = COALESCE($1, title),
       body             = COALESCE($2, body),
       excerpt          = COALESCE($3, excerpt),
       tags             = COALESCE($4, tags),
       status           = COALESCE($5, status),
       published_at     = CASE WHEN $5 = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
       cover_image_url  = COALESCE($6, cover_image_url)
     WHERE id = $7
     RETURNING *`,
    [title, realBody !== undefined ? realBody : null, excerpt, tags, status, imgUrl, id]
  );

  res.json(new ApiResponse(200, { story: result.rows[0] }, 'Story updated'));
});

// ─── Upload cover image ──────────────────────────────────────
export const updateStoryCover = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) throw new ApiError(400, 'No image provided');

  const check = await query('SELECT author_id, cover_image_url FROM stories WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'Story not found');
  if (check.rows[0].author_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  const oldUrl = check.rows[0].cover_image_url;
  if (oldUrl) {
    const pid = extractPublicId(oldUrl);
    if (pid) await deleteFromCloudinary(pid).catch(() => {});
  }

  const uploaded = await uploadToCloudinary(req.file.buffer, 'stories/covers', {
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
  });

  const result = await query(
    'UPDATE stories SET cover_image_url = $1 WHERE id = $2 RETURNING id, cover_image_url',
    [uploaded.secure_url, id]
  );

  res.json(new ApiResponse(200, { story: result.rows[0] }, 'Cover updated'));
});

// ─── Delete story ────────────────────────────────────────────
export const deleteStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const check = await query('SELECT author_id FROM stories WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'Story not found');
  if (check.rows[0].author_id !== req.user.id) throw new ApiError(403, 'Not authorized');

  await query("UPDATE stories SET status = 'archived' WHERE id = $1", [id]);
  res.json(new ApiResponse(200, null, 'Story archived'));
});