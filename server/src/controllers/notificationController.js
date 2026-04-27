import { query } from '../config/db.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ─── Get my notifications ─────────────────────────────────────
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread_only } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let filter = 'WHERE n.user_id = $1';
  if (unread_only === 'true') filter += ' AND n.is_read = FALSE';

  const result = await query(
    `SELECT n.id, n.type, n.title, n.body, n.action_url,
            n.entity_type, n.entity_id, n.is_read, n.read_at, n.created_at
     FROM notifications n
     ${filter}
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.user.id, parseInt(limit), offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [req.user.id]
  );

  res.json(new ApiResponse(200, {
    notifications: result.rows,
    unread_count: parseInt(countResult.rows[0].count),
    pagination: { page: parseInt(page), limit: parseInt(limit) },
  }));
});

// ─── Mark one notification as read ───────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, req.user.id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Notification not found');
  res.json(new ApiResponse(200, null, 'Marked as read'));
});

// ─── Mark all notifications as read ──────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
  await query(
    'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = $1 AND is_read = FALSE',
    [req.user.id]
  );
  res.json(new ApiResponse(200, null, 'All notifications marked as read'));
});

// ─── Delete a notification ────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user.id]
  );

  if (!result.rows[0]) throw new ApiError(404, 'Notification not found');
  res.json(new ApiResponse(200, null, 'Notification deleted'));
});

// ─── Get notification preferences ────────────────────────────
export const getPreferences = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT * FROM notification_preferences WHERE user_id = $1',
    [req.user.id]
  );
  res.json(new ApiResponse(200, { preferences: result.rows[0] || {} }));
});

// ─── Update notification preferences ─────────────────────────
export const updatePreferences = asyncHandler(async (req, res) => {
  const {
    in_app_enabled,
    email_bookings, email_reviews, email_messages,
    email_promotions, email_weekly_digest,
    push_bookings, push_reviews, push_messages, push_reminders,
  } = req.body;

  const result = await query(
    `INSERT INTO notification_preferences
       (user_id, in_app_enabled,
        email_bookings, email_reviews, email_messages, email_promotions, email_weekly_digest,
        push_bookings, push_reviews, push_messages, push_reminders)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (user_id) DO UPDATE SET
       in_app_enabled      = COALESCE($2,  notification_preferences.in_app_enabled),
       email_bookings      = COALESCE($3,  notification_preferences.email_bookings),
       email_reviews       = COALESCE($4,  notification_preferences.email_reviews),
       email_messages      = COALESCE($5,  notification_preferences.email_messages),
       email_promotions    = COALESCE($6,  notification_preferences.email_promotions),
       email_weekly_digest = COALESCE($7,  notification_preferences.email_weekly_digest),
       push_bookings       = COALESCE($8,  notification_preferences.push_bookings),
       push_reviews        = COALESCE($9,  notification_preferences.push_reviews),
       push_messages       = COALESCE($10, notification_preferences.push_messages),
       push_reminders      = COALESCE($11, notification_preferences.push_reminders),
       updated_at          = NOW()
     RETURNING *`,
    [req.user.id, in_app_enabled,
     email_bookings, email_reviews, email_messages, email_promotions, email_weekly_digest,
     push_bookings, push_reviews, push_messages, push_reminders]
  );

  res.json(new ApiResponse(200, { preferences: result.rows[0] }, 'Preferences updated'));
});