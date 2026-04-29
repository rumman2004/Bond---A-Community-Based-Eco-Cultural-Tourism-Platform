import { query } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to update aggregated ratings for experience and community
const updateAggregatedRatings = async (experience_id, community_id) => {
  try {
    // 1. Update Experience average rating and total reviews
    await query(
      `UPDATE experiences
       SET avg_rating = (
         SELECT COALESCE(AVG(rating), 0)
         FROM reviews
         WHERE experience_id = $1 AND is_visible = TRUE
       ),
       total_reviews = (
         SELECT COUNT(*)
         FROM reviews
         WHERE experience_id = $1 AND is_visible = TRUE
       )
       WHERE id = $1`,
      [experience_id]
    );

    // 2. Update Community average rating (average of its experiences' averages)
    // As per user request: "the total stars of the different experiences within the community and their average would be the rating of community"
    await query(
      `UPDATE communities
       SET avg_rating = (
         SELECT COALESCE(AVG(avg_rating), 0)
         FROM experiences
         WHERE community_id = $1 AND status = 'active' AND total_reviews > 0
       ),
       total_reviews = (
         SELECT COALESCE(SUM(total_reviews), 0)
         FROM experiences
         WHERE community_id = $1
       )
       WHERE id = $1`,
      [community_id]
    );
  } catch (err) {
    console.error('Failed to update aggregated ratings:', err);
  }
};

// ─── Get reviews for an experience (public) ──────────────────
export const getExperienceReviews = asyncHandler(async (req, res) => {
  const { experience_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const result = await query(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at,
            u.full_name AS tourist_name, u.avatar_url AS tourist_avatar
     FROM reviews r
     JOIN users u ON u.id = r.tourist_id
     WHERE r.experience_id = $1 AND r.is_visible = TRUE
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [experience_id, parseInt(limit), offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) FROM reviews WHERE experience_id = $1 AND is_visible = TRUE',
    [experience_id]
  );

  res.json(new ApiResponse(200, {
    reviews: result.rows,
    pagination: { total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) },
  }));
});

// ─── Create review (tourist, only for completed bookings) ────
export const createReview = asyncHandler(async (req, res) => {
  const { booking_id, rating, title, body } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating between 1 and 5 is required');
  }

  // Validate booking: must be completed, by this tourist, not already reviewed
  const bookingResult = await query(
    `SELECT b.id, b.experience_id, b.community_id, b.status, b.tourist_id
     FROM bookings b WHERE b.id = $1`,
    [booking_id]
  );

  const booking = bookingResult.rows[0];
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.tourist_id !== req.user.id) throw new ApiError(403, 'Not your booking');
  if (booking.status !== 'completed') throw new ApiError(400, 'Can only review completed bookings');

  const existing = await query('SELECT id FROM reviews WHERE booking_id = $1', [booking_id]);
  if (existing.rowCount > 0) throw new ApiError(409, 'You already reviewed this booking');

  const result = await query(
    `INSERT INTO reviews (booking_id, tourist_id, experience_id, community_id, rating, title, body)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [booking_id, req.user.id, booking.experience_id, booking.community_id, rating, title, body]
  );

  // Aggregation
  await updateAggregatedRatings(booking.experience_id, booking.community_id);

  res.status(201).json(new ApiResponse(201, { review: result.rows[0] }, 'Review submitted successfully'));
});

// ─── Update own review ────────────────────────────────────────
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, body } = req.body;

  const check = await query('SELECT tourist_id, experience_id, community_id FROM reviews WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'Review not found');
  if (check.rows[0].tourist_id !== req.user.id) throw new ApiError(403, 'Not your review');

  const result = await query(
    `UPDATE reviews
     SET rating = COALESCE($1, rating),
         title  = COALESCE($2, title),
         body   = COALESCE($3, body)
     WHERE id = $4
     RETURNING *`,
    [rating, title, body, id]
  );

  await updateAggregatedRatings(check.rows[0].experience_id, check.rows[0].community_id);

  res.json(new ApiResponse(200, { review: result.rows[0] }, 'Review updated'));
});

// ─── Delete own review ────────────────────────────────────────
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const check = await query('SELECT tourist_id, experience_id, community_id FROM reviews WHERE id = $1', [id]);
  if (!check.rows[0]) throw new ApiError(404, 'Review not found');
  if (check.rows[0].tourist_id !== req.user.id) throw new ApiError(403, 'Not your review');

  await query('DELETE FROM reviews WHERE id = $1', [id]);
  
  await updateAggregatedRatings(check.rows[0].experience_id, check.rows[0].community_id);

  res.json(new ApiResponse(200, null, 'Review deleted'));
});

// ─── Hide review (security / admin) ─────────────────────────
export const hideReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hidden_reason } = req.body;

  const result = await query(
    `UPDATE reviews SET is_visible = FALSE, hidden_reason = $1 WHERE id = $2 RETURNING id, experience_id, community_id`,
    [hidden_reason, id]
  );
  if (!result.rows[0]) throw new ApiError(404, 'Review not found');

  await updateAggregatedRatings(result.rows[0].experience_id, result.rows[0].community_id);

  res.json(new ApiResponse(200, null, 'Review hidden'));
});
