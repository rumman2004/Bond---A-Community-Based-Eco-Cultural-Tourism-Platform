import { query } from '../config/db.js';

// ─── Read ─────────────────────────────────────────────────────

export const findNotificationsByUser = ({ user_id, unread_only, limit, offset }) => {
  let filter = 'WHERE user_id = $1';
  if (unread_only) filter += ' AND is_read = FALSE';

  return query(
    `SELECT id, type, title, body, action_url,
            entity_type, entity_id,
            is_read, read_at, created_at
     FROM notifications
     ${filter}
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [user_id, limit, offset]
  );
};

export const countUnread = (user_id) =>
  query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [user_id]
  );

export const findNotificationById = (id, user_id) =>
  query(
    `SELECT id FROM notifications WHERE id = $1 AND user_id = $2`,
    [id, user_id]
  );

// ─── Create (used by services and triggers) ───────────────────

export const createNotification = ({
  user_id, type, title, body, action_url,
  entity_type, entity_id,
}) =>
  query(
    `INSERT INTO notifications
       (user_id, type, title, body, action_url, entity_type, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user_id, type, title, body, action_url, entity_type, entity_id]
  );

export const createManyNotifications = async (notifications) => {
  // Bulk insert — each item: { user_id, type, title, body, action_url, entity_type, entity_id }
  if (!notifications.length) return;

  const values = notifications
    .map((_, i) => {
      const base = i * 7;
      return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7})`;
    })
    .join(', ');

  const params = notifications.flatMap((n) => [
    n.user_id, n.type, n.title, n.body,
    n.action_url ?? null, n.entity_type ?? null, n.entity_id ?? null,
  ]);

  return query(
    `INSERT INTO notifications
       (user_id, type, title, body, action_url, entity_type, entity_id)
     VALUES ${values}`,
    params
  );
};

// ─── Update ───────────────────────────────────────────────────

export const markAsRead = (id, user_id) =>
  query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, user_id]
  );

export const markAllAsRead = (user_id) =>
  query(
    `UPDATE notifications
     SET is_read = TRUE, read_at = NOW()
     WHERE user_id = $1 AND is_read = FALSE`,
    [user_id]
  );

// ─── Delete ───────────────────────────────────────────────────

export const deleteNotification = (id, user_id) =>
  query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, user_id]
  );

export const deleteAllReadNotifications = (user_id) =>
  query(
    `DELETE FROM notifications WHERE user_id = $1 AND is_read = TRUE`,
    [user_id]
  );

// ─── Preferences ─────────────────────────────────────────────

export const getPreferences = (user_id) =>
  query(
    `SELECT * FROM notification_preferences WHERE user_id = $1`,
    [user_id]
  );

export const upsertPreferences = ({
  user_id, in_app_enabled,
  email_bookings, email_reviews, email_messages, email_promotions, email_weekly_digest,
  push_bookings, push_reviews, push_messages, push_reminders,
}) =>
  query(
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
    [user_id, in_app_enabled,
     email_bookings, email_reviews, email_messages, email_promotions, email_weekly_digest,
     push_bookings, push_reviews, push_messages, push_reminders]
  );

// ─── Push tokens ─────────────────────────────────────────────

export const upsertPushToken = ({ user_id, token, platform, device_name }) =>
  query(
    `INSERT INTO push_tokens (user_id, token, platform, device_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (token) DO UPDATE SET
       is_active   = TRUE,
       last_used   = NOW(),
       device_name = EXCLUDED.device_name
     RETURNING *`,
    [user_id, token, platform, device_name]
  );

export const getActivePushTokens = (user_id) =>
  query(
    `SELECT token, platform FROM push_tokens
     WHERE user_id = $1 AND is_active = TRUE`,
    [user_id]
  );

export const deactivatePushToken = (token) =>
  query(
    `UPDATE push_tokens SET is_active = FALSE WHERE token = $1`,
    [token]
  );
