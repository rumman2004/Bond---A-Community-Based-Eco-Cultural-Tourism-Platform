import { notificationModel } from "../models/notificationModel.js";
import { sendNotificationEmail } from "./emailService.js";
import { logger } from "../utils/logger.js";

// ─── Notification Types ───────────────────────────────────────────────────────
// Single source of truth — used by controllers + frontend store

export const NOTIFICATION_TYPES = Object.freeze({
  // Bookings
  BOOKING_CONFIRMED:   "booking_confirmed",
  BOOKING_CANCELLED:   "booking_cancelled",
  BOOKING_NEW:         "booking_new",          // to community host
  BOOKING_REMINDER:    "booking_reminder",

  // Reviews
  REVIEW_RECEIVED:     "review_received",

  // Community
  COMMUNITY_VERIFIED:  "community_verified",
  COMMUNITY_REJECTED:  "community_rejected",

  // Stories
  STORY_PUBLISHED:     "story_published",

  // Reports / Security
  REPORT_RECEIVED:     "report_received",
  ACCOUNT_SUSPENDED:   "account_suspended",
  ACCOUNT_RESTORED:    "account_restored",

  // System
  WELCOME:             "welcome",
  SYSTEM:              "system",
});

// ─── Core: Create Notification ────────────────────────────────────────────────

/**
 * Create a single in-app notification.
 * Optionally also sends an email if `sendEmail` is true and user has email.
 *
 * @param {{
 *   userId:     string,
 *   type:       string,         — one of NOTIFICATION_TYPES
 *   title:      string,
 *   message:    string,
 *   data?:      object,         — extra context (bookingId, experienceId, etc.)
 *   sendEmail?: boolean,
 *   userEmail?: string,
 *   userName?:  string,
 *   ctaUrl?:    string,
 * }} params
 * @returns {Promise<object>} created notification row
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
  sendEmail = false,
  userEmail,
  userName,
  ctaUrl,
}) => {
  try {
    const notification = await notificationModel.create({
      userId,
      type,
      title,
      message,
      data,
    });

    // Optionally fire email (non-blocking — failure won't break the main flow)
    if (sendEmail && userEmail) {
      sendNotificationEmail({
        to:      userEmail,
        name:    userName || "there",
        subject: title,
        message,
        ctaUrl,
      }).catch((err) =>
        logger.warn(`[NotificationService] Email failed for userId=${userId}: ${err.message}`)
      );
    }

    return notification;
  } catch (err) {
    logger.error(`[NotificationService] createNotification failed: ${err.message}`);
    throw err;
  }
};

// ─── Bulk Create ─────────────────────────────────────────────────────────────

/**
 * Create the same notification for multiple users at once.
 * Used for admin broadcasts or multi-host alerts.
 *
 * @param {string[]} userIds
 * @param {{ type, title, message, data? }} notificationPayload
 */
export const createBulkNotifications = async (userIds, notificationPayload) => {
  try {
    const rows = userIds.map((userId) => ({ userId, ...notificationPayload }));
    return await notificationModel.bulkCreate(rows);
  } catch (err) {
    logger.error(`[NotificationService] bulkCreate failed: ${err.message}`);
    throw err;
  }
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Get paginated notifications for a user, newest first.
 *
 * @param {string} userId
 * @param {{ page?: number, limit?: number, unreadOnly?: boolean }} options
 * @returns {Promise<{ notifications: object[], total: number, unreadCount: number }>}
 */
export const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const offset = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    notificationModel.findByUser(userId, { limit, offset, unreadOnly }),
    notificationModel.countByUser(userId),
    notificationModel.countUnread(userId),
  ]);
  return { notifications, total, unreadCount };
};

// ─── Mark Read ────────────────────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 * @param {string} notificationId
 * @param {string} userId — ensures users can only mark their own
 */
export const markAsRead = async (notificationId, userId) => {
  return notificationModel.markRead(notificationId, userId);
};

/**
 * Mark all notifications as read for a user.
 * @param {string} userId
 */
export const markAllAsRead = async (userId) => {
  return notificationModel.markAllRead(userId);
};

/**
 * Delete a notification (user-initiated).
 * @param {string} notificationId
 * @param {string} userId
 */
export const deleteNotification = async (notificationId, userId) => {
  return notificationModel.deleteOne(notificationId, userId);
};

// ─── Domain-specific Helpers ─────────────────────────────────────────────────
// Called by controllers so they don't have to construct payloads manually.

export const notifyBookingConfirmed = (tourist, booking) =>
  createNotification({
    userId:     tourist.id,
    type:       NOTIFICATION_TYPES.BOOKING_CONFIRMED,
    title:      "Booking Confirmed!",
    message:    `Your booking for "${booking.experienceTitle}" on ${booking.date} is confirmed.`,
    data:       { bookingId: booking.id },
    sendEmail:  true,
    userEmail:  tourist.email,
    userName:   tourist.name,
    ctaUrl:     `/tourist/bookings`,
  });

export const notifyNewBookingToHost = (host, booking) =>
  createNotification({
    userId:     host.id,
    type:       NOTIFICATION_TYPES.BOOKING_NEW,
    title:      "New Booking Received",
    message:    `${booking.touristName} booked "${booking.experienceTitle}" for ${booking.date}.`,
    data:       { bookingId: booking.id },
    sendEmail:  true,
    userEmail:  host.email,
    userName:   host.name,
    ctaUrl:     `/community/bookings`,
  });

export const notifyBookingCancelled = (recipient, booking, cancelledBy) =>
  createNotification({
    userId:    recipient.id,
    type:      NOTIFICATION_TYPES.BOOKING_CANCELLED,
    title:     "Booking Cancelled",
    message:   `Booking for "${booking.experienceTitle}" on ${booking.date} was cancelled by ${cancelledBy}.`,
    data:      { bookingId: booking.id },
    sendEmail: true,
    userEmail: recipient.email,
    userName:  recipient.name,
  });

export const notifyCommunityVerified = (host, approved, reason) =>
  createNotification({
    userId:    host.id,
    type:      approved
      ? NOTIFICATION_TYPES.COMMUNITY_VERIFIED
      : NOTIFICATION_TYPES.COMMUNITY_REJECTED,
    title:     approved ? "Community Verified ✅" : "Verification Update",
    message:   approved
      ? "Your community profile has been verified. You can now publish experiences!"
      : `Your verification was not approved. Reason: ${reason || "See your profile for details."}`,
    sendEmail: true,
    userEmail: host.email,
    userName:  host.name,
    ctaUrl:    approved ? `/community/experiences/new` : `/community/profile`,
  });

export const notifyReviewReceived = (host, review) =>
  createNotification({
    userId:  host.id,
    type:    NOTIFICATION_TYPES.REVIEW_RECEIVED,
    title:   "New Review",
    message: `${review.touristName} left a ${review.rating}★ review on "${review.experienceTitle}".`,
    data:    { reviewId: review.id, experienceId: review.experienceId },
  });

export const notifyAccountSuspended = (user, reason) =>
  createNotification({
    userId:    user.id,
    type:      NOTIFICATION_TYPES.ACCOUNT_SUSPENDED,
    title:     "Account Suspended",
    message:   `Your account has been suspended. Reason: ${reason || "Violation of community guidelines."}`,
    sendEmail: true,
    userEmail: user.email,
    userName:  user.name,
  });