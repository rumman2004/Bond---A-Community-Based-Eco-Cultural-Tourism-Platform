import { bookingModel } from "../models/bookingModel.js";
import { experienceModel } from "../models/experienceModel.js";
import { userModel } from "../models/userModel.js";
import { reviewModel } from "../models/reviewModel.js";
import { storyModel } from "../models/storyModel.js";
import { reportModel } from "../models/reportModel.js";
import { logger } from "../utils/logger.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Group an array of { date, value } records by month → { "2024-05": 12, ... }
 */
const groupByMonth = (records, dateField = "createdAt", valueField = null) => {
  return records.reduce((acc, record) => {
    const month = new Date(record[dateField]).toISOString().slice(0, 7); // "YYYY-MM"
    const val   = valueField ? Number(record[valueField]) : 1;
    acc[month]  = (acc[month] || 0) + val;
    return acc;
  }, {});
};

/**
 * Calculate % change between two numbers.
 * Returns null if previous is 0 (avoid division by zero).
 */
const percentChange = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
};

// ─── 1. Admin Dashboard Overview ─────────────────────────────────────────────

/**
 * Platform-wide summary for the admin dashboard.
 * Returns KPIs + month-over-month changes.
 *
 * @returns {Promise<object>}
 */
export const getAdminOverview = async () => {
  try {
    const now       = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalBookings,
      bookingsThisMonth,
      bookingsLastMonth,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      activeCommunities,
      pendingVerifications,
      openReports,
      totalExperiences,
    ] = await Promise.all([
      userModel.count(),
      userModel.countSince(thisMonth),
      userModel.countBetween(lastMonth, thisMonth),
      bookingModel.count({ status: "confirmed" }),
      bookingModel.countSince(thisMonth, "confirmed"),
      bookingModel.countBetween(lastMonth, thisMonth, "confirmed"),
      bookingModel.sumRevenue(),
      bookingModel.sumRevenueSince(thisMonth),
      bookingModel.sumRevenueBetween(lastMonth, thisMonth),
      userModel.countByRole("community", { verified: true }),
      userModel.countByRole("community", { verified: false }),
      reportModel.countOpen(),
      experienceModel.count({ status: "active" }),
    ]);

    return {
      users: {
        total:         totalUsers,
        thisMonth:     newUsersThisMonth,
        change:        percentChange(newUsersThisMonth, newUsersLastMonth),
      },
      bookings: {
        total:         totalBookings,
        thisMonth:     bookingsThisMonth,
        change:        percentChange(bookingsThisMonth, bookingsLastMonth),
      },
      revenue: {
        total:         totalRevenue,
        thisMonth:     revenueThisMonth,
        change:        percentChange(revenueThisMonth, revenueLastMonth),
      },
      communities: {
        active:        activeCommunities,
        pendingVerify: pendingVerifications,
      },
      experiences: {
        active: totalExperiences,
      },
      reports: {
        open: openReports,
      },
    };
  } catch (err) {
    logger.error(`[AnalyticsService] getAdminOverview failed: ${err.message}`);
    throw err;
  }
};

// ─── 2. User Growth Chart ─────────────────────────────────────────────────────

/**
 * Monthly user registrations for the past N months.
 * @param {number} [months=6]
 * @returns {Promise<Array<{ month: string, count: number }>>}
 */
export const getUserGrowthData = async (months = 6) => {
  try {
    const since   = new Date();
    since.setMonth(since.getMonth() - months);
    const users   = await userModel.findSince(since, ["createdAt"]);
    const grouped = groupByMonth(users);

    return Object.entries(grouped)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (err) {
    logger.error(`[AnalyticsService] getUserGrowthData failed: ${err.message}`);
    return [];
  }
};

// ─── 3. Revenue Chart ─────────────────────────────────────────────────────────

/**
 * Monthly revenue for the past N months.
 * @param {number} [months=6]
 * @returns {Promise<Array<{ month: string, revenue: number }>>}
 */
export const getRevenueChartData = async (months = 6) => {
  try {
    const since    = new Date();
    since.setMonth(since.getMonth() - months);
    const bookings = await bookingModel.findSince(since, { status: "confirmed" });

    const grouped = bookings.reduce((acc, b) => {
      const month  = new Date(b.createdAt).toISOString().slice(0, 7);
      acc[month]   = (acc[month] || 0) + Number(b.totalAmount || 0);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (err) {
    logger.error(`[AnalyticsService] getRevenueChartData failed: ${err.message}`);
    return [];
  }
};

// ─── 4. Top Experiences ───────────────────────────────────────────────────────

/**
 * Top N experiences by booking count (platform-wide).
 * @param {number} [limit=10]
 * @returns {Promise<object[]>}
 */
export const getTopExperiences = async (limit = 10) => {
  try {
    return experienceModel.findTopByBookings(limit);
  } catch (err) {
    logger.error(`[AnalyticsService] getTopExperiences failed: ${err.message}`);
    return [];
  }
};

// ─── 5. Top Communities ───────────────────────────────────────────────────────

/**
 * Top N communities by total earnings.
 * @param {number} [limit=10]
 * @returns {Promise<object[]>}
 */
export const getTopCommunities = async (limit = 10) => {
  try {
    return userModel.findTopCommunitiesByEarnings(limit);
  } catch (err) {
    logger.error(`[AnalyticsService] getTopCommunities failed: ${err.message}`);
    return [];
  }
};

// ─── 6. Community Dashboard Analytics ────────────────────────────────────────

/**
 * Analytics summary for a single community host's dashboard.
 *
 * @param {string} communityId
 * @returns {Promise<object>}
 */
export const getCommunityAnalytics = async (communityId) => {
  try {
    const now       = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalBookings,
      bookingsThisMonth,
      bookingsLastMonth,
      totalEarnings,
      earningsThisMonth,
      earningsLastMonth,
      avgRating,
      totalReviews,
      totalStories,
      activeExperiences,
    ] = await Promise.all([
      bookingModel.countByCommunity(communityId, { status: "confirmed" }),
      bookingModel.countByCommunityBetween(communityId, thisMonth, null, "confirmed"),
      bookingModel.countByCommunityBetween(communityId, lastMonth, thisMonth, "confirmed"),
      bookingModel.sumEarningsByCommunity(communityId),
      bookingModel.sumEarningsByCommunityBetween(communityId, thisMonth, null),
      bookingModel.sumEarningsByCommunityBetween(communityId, lastMonth, thisMonth),
      reviewModel.avgRatingByCommunity(communityId),
      reviewModel.countByCommunity(communityId),
      storyModel.countByUser(communityId),
      experienceModel.countByUser(communityId, { status: "active" }),
    ]);

    return {
      bookings: {
        total:     totalBookings,
        thisMonth: bookingsThisMonth,
        change:    percentChange(bookingsThisMonth, bookingsLastMonth),
      },
      earnings: {
        total:     totalEarnings,
        thisMonth: earningsThisMonth,
        change:    percentChange(earningsThisMonth, earningsLastMonth),
      },
      rating: {
        average: avgRating ? Number(avgRating).toFixed(1) : null,
        total:   totalReviews,
      },
      content: {
        stories:     totalStories,
        experiences: activeExperiences,
      },
    };
  } catch (err) {
    logger.error(`[AnalyticsService] getCommunityAnalytics failed for ${communityId}: ${err.message}`);
    throw err;
  }
};

// ─── 7. Booking Status Breakdown ─────────────────────────────────────────────

/**
 * Breakdown of booking statuses for admin reports.
 * @returns {Promise<{ confirmed: number, pending: number, cancelled: number }>}
 */
export const getBookingStatusBreakdown = async () => {
  try {
    const [confirmed, pending, cancelled] = await Promise.all([
      bookingModel.count({ status: "confirmed" }),
      bookingModel.count({ status: "pending" }),
      bookingModel.count({ status: "cancelled" }),
    ]);
    return { confirmed, pending, cancelled };
  } catch (err) {
    logger.error(`[AnalyticsService] getBookingStatusBreakdown failed: ${err.message}`);
    return { confirmed: 0, pending: 0, cancelled: 0 };
  }
};

// ─── 8. Activity Logs Summary ─────────────────────────────────────────────────

/**
 * Recent platform activity — new users, bookings, stories, reports.
 * Used on the admin dashboard activity feed.
 *
 * @param {number} [limit=20]
 * @returns {Promise<object[]>}
 */
export const getRecentActivity = async (limit = 20) => {
  try {
    const [recentUsers, recentBookings, recentReports] = await Promise.all([
      userModel.findRecent(limit),
      bookingModel.findRecent(limit),
      reportModel.findRecent(limit),
    ]);

    // Merge into a unified activity feed sorted by date
    const feed = [
      ...recentUsers.map((u) => ({
        type:      "user_registered",
        message:   `New ${u.role} registered: ${u.name}`,
        timestamp: u.createdAt,
        meta:      { userId: u.id, role: u.role },
      })),
      ...recentBookings.map((b) => ({
        type:      "booking_created",
        message:   `Booking #${b.id} for "${b.experienceTitle}"`,
        timestamp: b.createdAt,
        meta:      { bookingId: b.id },
      })),
      ...recentReports.map((r) => ({
        type:      "report_submitted",
        message:   `Report submitted against ${r.reportedType}: ${r.reason}`,
        timestamp: r.createdAt,
        meta:      { reportId: r.id },
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return feed;
  } catch (err) {
    logger.error(`[AnalyticsService] getRecentActivity failed: ${err.message}`);
    return [];
  }
};