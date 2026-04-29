import { query } from '../config/db.js';

// ─── Public queries ───────────────────────────────────────────

export const findStories = ({ community_id, tag, search, featured, limit, offset }) => {
  const params = [];
  const filters = ["s.status = 'published'"];

  if (community_id) { params.push(community_id); filters.push(`s.community_id = $${params.length}`); }
  if (tag)          { params.push(tag);           filters.push(`$${params.length} = ANY(s.tags)`); }
  if (featured === 'true') filters.push('s.is_featured = TRUE');
  if (search) {
    params.push(`%${search}%`);
    filters.push(`s.title ILIKE $${params.length}`);
  }

  const where = filters.join(' AND ');
  params.push(limit, offset);

  return query(
    `SELECT s.id, s.title, s.slug, s.excerpt, s.cover_image_url,
            s.tags, s.category, s.view_count, s.like_count, s.published_at,
            c.name AS community_name, c.slug AS community_slug,
            c.village, c.state,
            u.full_name AS author_name, u.avatar_url AS author_avatar
     FROM stories s
     JOIN communities c ON c.id = s.community_id
     JOIN users u ON u.id = s.author_id
     WHERE ${where}
     ORDER BY s.published_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
};

export const countStories = ({ community_id, tag, search, featured }) => {
  const params = [];
  const filters = ["s.status = 'published'"];

  if (community_id) { params.push(community_id); filters.push(`s.community_id = $${params.length}`); }
  if (tag)          { params.push(tag);           filters.push(`$${params.length} = ANY(s.tags)`); }
  if (featured === 'true') filters.push('s.is_featured = TRUE');
  if (search) {
    params.push(`%${search}%`);
    filters.push(`s.title ILIKE $${params.length}`);
  }

  return query(
    `SELECT COUNT(*) FROM stories s WHERE ${filters.join(' AND ')}`,
    params
  );
};

export const findStoryBySlug = (slug) =>
  query(
    `SELECT s.*,
            c.name AS community_name, c.slug AS community_slug,
            c.logo_url AS community_logo, c.village, c.state,
            u.full_name AS author_name, u.avatar_url AS author_avatar
     FROM stories s
     JOIN communities c ON c.id = s.community_id
     JOIN users u ON u.id = s.author_id
     WHERE s.slug = $1 AND s.status = 'published'`,
    [slug]
  );

export const findStoryById = (id) =>
  query(`SELECT * FROM stories WHERE id = $1`, [id]);

export const findStoryAuthor = (id) =>
  query(`SELECT author_id, cover_image_url FROM stories WHERE id = $1`, [id]);

// ─── Community dashboard: all stories by owner ───────────────

export const findStoriesByOwner = (user_id) =>
  query(
    `SELECT s.id, s.title, s.slug, s.status, s.view_count, s.like_count,
            s.published_at, s.created_at
     FROM stories s
     JOIN communities c ON c.id = s.community_id
     WHERE c.user_id = $1
     ORDER BY s.created_at DESC`,
    [user_id]
  );

export const findStoriesByCommunityId = (community_id) =>
  query(
    `SELECT id, title, slug, status, view_count, like_count, published_at, created_at
     FROM stories WHERE community_id = $1 ORDER BY created_at DESC`,
    [community_id]
  );

// ─── Create & update ─────────────────────────────────────────

export const createStory = ({ community_id, author_id, title, slug, body, excerpt, tags, category, cover_url, cover_image_url }) =>
  query(
    `INSERT INTO stories (community_id, author_id, title, slug, body, excerpt, tags, category, status, published_at, cover_image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', NOW(), $9)
     RETURNING *`,
    [community_id, author_id, title, slug, body, excerpt, tags, category, cover_url || cover_image_url]
  );

export const updateStory = (id, { title, body, excerpt, tags, category, status, cover_url, cover_image_url }) =>
  query(
    `UPDATE stories SET
       title            = COALESCE($1, title),
       body             = COALESCE($2, body),
       excerpt          = COALESCE($3, excerpt),
       tags             = COALESCE($4, tags),
       category         = COALESCE($5, category),
       status           = COALESCE($6, status),
       published_at     = CASE
                            WHEN $6 = 'published' AND published_at IS NULL THEN NOW()
                            ELSE published_at
                          END,
       cover_image_url  = COALESCE($7, cover_image_url)
     WHERE id = $8
     RETURNING *`,
    [title, body, excerpt, tags, category, status, cover_url || cover_image_url, id]
  );

export const updateStoryCoverImage = (id, cover_image_url) =>
  query(
    `UPDATE stories SET cover_image_url = $1 WHERE id = $2
     RETURNING id, cover_image_url`,
    [cover_image_url, id]
  );

export const archiveStory = (id) =>
  query(`UPDATE stories SET status = 'archived' WHERE id = $1`, [id]);

// ─── Engagement ───────────────────────────────────────────────

export const incrementViewCount = (id) =>
  query(`UPDATE stories SET view_count = view_count + 1 WHERE id = $1`, [id]);

export const likeStory = (user_id, story_id) =>
  query(
    `INSERT INTO story_likes (user_id, story_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, story_id) DO NOTHING`,
    [user_id, story_id]
  );

export const unlikeStory = (user_id, story_id) =>
  query(
    `DELETE FROM story_likes WHERE user_id = $1 AND story_id = $2`,
    [user_id, story_id]
  );

export const syncLikeCount = (story_id) =>
  query(
    `UPDATE stories
     SET like_count = (SELECT COUNT(*) FROM story_likes WHERE story_id = $1)
     WHERE id = $1`,
    [story_id]
  );

export const hasUserLiked = (user_id, story_id) =>
  query(
    `SELECT 1 FROM story_likes WHERE user_id = $1 AND story_id = $2`,
    [user_id, story_id]
  );

// ─── Slug check ───────────────────────────────────────────────

export const checkSlugExists = (slug) =>
  query(`SELECT id FROM stories WHERE slug = $1`, [slug]);

// ─── Featured / admin ─────────────────────────────────────────

export const setFeatured = (id, is_featured) =>
  query(
    `UPDATE stories SET is_featured = $1 WHERE id = $2 RETURNING id, is_featured`,
    [is_featured, id]
  );
