import { query } from '../config/db.js';

// ─── Read ─────────────────────────────────────────────────────

export const findReviewsByExperience = ({ experience_id, limit, offset }) =>
  query(
    `SELECT r.id, r.rating, r.title, r.body,
            r.rating_hospitality, r.rating_authenticity,
            r.rating_value, r.rating_cleanliness,
            r.photo_urls, r.response_body, r.responded_at,
            r.created_at,
            u.full_name AS tourist_name, u.avatar_url AS tourist_avatar
     FROM reviews r
     JOIN users u ON u.id = r.tourist_id
     WHERE r.experience_id = $1 AND r.is_visible = TRUE
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [experience_id, limit, offset]
  );

export const countReviewsByExperience = (experience_id) =>
  query(
    `SELECT COUNT(*) FROM reviews
     WHERE experience_id = $1 AND is_visible = TRUE`,
    [experience_id]
  );

export const findReviewsByCommunity = ({ community_id, limit, offset }) =>
  query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at,
            e.title AS experience_title,
            u.full_name AS tourist_name, u.avatar_url AS tourist_avatar
     FROM reviews r
     JOIN users u ON u.id = r.tourist_id
     JOIN experiences e ON e.id = r.experience_id
     WHERE r.community_id = $1 AND r.is_visible = TRUE
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [community_id, limit, offset]
  );

export const findReviewById = (id) =>
  query(
    `SELECT r.*, u.full_name AS tourist_name
     FROM reviews r
     JOIN users u ON u.id = r.tourist_id
     WHERE r.id = $1`,
    [id]
  );

export const findReviewByBooking = (booking_id) =>
  query(`SELECT id FROM reviews WHERE booking_id = $1`, [booking_id]);

export const findReviewOwner = (id) =>
  query(`SELECT tourist_id FROM reviews WHERE id = $1`, [id]);

// ─── Create ───────────────────────────────────────────────────

export const createReview = ({
  booking_id, tourist_id, experience_id, community_id,
  rating, title, body,
  rating_hospitality, rating_authenticity, rating_value, rating_cleanliness,
  photo_urls,
}) =>
  query(
    `INSERT INTO reviews
       (booking_id, tourist_id, experience_id, community_id,
        rating, title, body,
        rating_hospitality, rating_authenticity, rating_value, rating_cleanliness,
        photo_urls)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [booking_id, tourist_id, experience_id, community_id,
     rating, title, body,
     rating_hospitality, rating_authenticity, rating_value, rating_cleanliness,
     photo_urls]
  );

// ─── Update ───────────────────────────────────────────────────

export const updateReview = (id, { rating, title, body }) =>
  query(
    `UPDATE reviews
     SET rating = COALESCE($1, rating),
         title  = COALESCE($2, title),
         body   = COALESCE($3, body)
     WHERE id = $4
     RETURNING *`,
    [rating, title, body, id]
  );

export const addCommunityResponse = (id, response_body) =>
  query(
    `UPDATE reviews
     SET response_body = $1, responded_at = NOW()
     WHERE id = $2
     RETURNING id, response_body, responded_at`,
    [response_body, id]
  );

// ─── Moderation (security / admin) ───────────────────────────

export const hideReview = (id, flagged_reason) =>
  query(
    `UPDATE reviews
     SET is_visible = FALSE, flagged = TRUE, flagged_reason = $1
     WHERE id = $2
     RETURNING id`,
    [flagged_reason, id]
  );

export const unhideReview = (id) =>
  query(
    `UPDATE reviews
     SET is_visible = TRUE, flagged = FALSE, flagged_reason = NULL
     WHERE id = $1
     RETURNING id`,
    [id]
  );

export const flagReview = (id, flagged_reason) =>
  query(
    `UPDATE reviews
     SET flagged = TRUE, flagged_reason = $1
     WHERE id = $2 RETURNING id`,
    [flagged_reason, id]
  );

// ─── Delete ───────────────────────────────────────────────────

export const deleteReview = (id) =>
  query(`DELETE FROM reviews WHERE id = $1`, [id]);

// ─── Recent for experience detail page ───────────────────────

export const findRecentReviews = (experience_id, limit = 5) =>
  query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at,
            u.full_name AS tourist_name, u.avatar_url AS tourist_avatar
     FROM reviews r
     JOIN users u ON u.id = r.tourist_id
     WHERE r.experience_id = $1 AND r.is_visible = TRUE
     ORDER BY r.created_at DESC LIMIT $2`,
    [experience_id, limit]
  );
