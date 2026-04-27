import { experienceModel } from "../models/experienceModel.js";
import { bookingModel } from "../models/bookingModel.js";
import { logger } from "../utils/logger.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Haversine formula — straight-line distance between two lat/lng points in km.
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Score an experience for recommendation ranking.
 * Higher weight = more likely to surface.
 *
 * Factors:
 *   - Average rating    (0–5)     weight: 3x
 *   - Total bookings    (volume)  weight: 1x (log-scaled to avoid popularity bias)
 *   - Recency           (days)    weight: 1x (newer = higher)
 */
const scoreExperience = (exp) => {
  const ratingScore   = (exp.averageRating || 0) * 3;
  const bookingScore  = Math.log1p(exp.totalBookings || 0);
  const daysSinceCreate = (Date.now() - new Date(exp.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore  = Math.max(0, 30 - daysSinceCreate) / 30; // max boost for first 30 days
  return ratingScore + bookingScore + recencyScore;
};

// ─── 1. Interest-Based Recommendations ───────────────────────────────────────

/**
 * Recommend experiences matching a tourist's saved interests/tags.
 * Falls back to trending if the user has no interests set.
 *
 * @param {string}   userId
 * @param {string[]} interests    — array of tags e.g. ["eco", "cultural", "trekking"]
 * @param {number}   [limit]
 * @returns {Promise<object[]>}
 */
export const getInterestBasedRecommendations = async (userId, interests = [], limit = DEFAULT_LIMIT) => {
  try {
    if (!interests.length) {
      return getTrendingExperiences(limit);
    }

    // Get all active experiences matching any of the user's interest tags
    const experiences = await experienceModel.findByTags(interests, { status: "active" });

    // Exclude experiences the user has already booked
    const bookedIds = await bookingModel
      .findByUser(userId)
      .then((bookings) => bookings.map((b) => b.experienceId));

    const filtered = experiences.filter((e) => !bookedIds.includes(e.id));

    // Score and sort
    const scored = filtered
      .map((e) => ({ ...e, _score: scoreExperience(e) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);

    return scored;
  } catch (err) {
    logger.error(`[RecommendationService] getInterestBased failed: ${err.message}`);
    return [];
  }
};

// ─── 2. Location-Based Recommendations ───────────────────────────────────────

/**
 * Find experiences near a given coordinate, sorted by distance then score.
 *
 * @param {{ lat: number, lng: number }} userLocation
 * @param {number} [radiusKm=100]   — search radius
 * @param {number} [limit]
 * @returns {Promise<Array<object & { distanceKm: number }>>}
 */
export const getNearbyExperiences = async (userLocation, radiusKm = 100, limit = DEFAULT_LIMIT) => {
  try {
    if (!userLocation?.lat || !userLocation?.lng) return [];

    const allActive = await experienceModel.findAll({ status: "active" });

    const withDistance = allActive
      .filter((e) => e.latitude && e.longitude)
      .map((e) => ({
        ...e,
        distanceKm: haversineDistance(
          userLocation.lat,
          userLocation.lng,
          e.latitude,
          e.longitude
        ),
      }))
      .filter((e) => e.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm || scoreExperience(b) - scoreExperience(a))
      .slice(0, limit);

    return withDistance;
  } catch (err) {
    logger.error(`[RecommendationService] getNearby failed: ${err.message}`);
    return [];
  }
};

// ─── 3. Trending Experiences ──────────────────────────────────────────────────

/**
 * Get trending experiences globally — high booking volume + rating in last 30 days.
 *
 * @param {number} [limit]
 * @returns {Promise<object[]>}
 */
export const getTrendingExperiences = async (limit = DEFAULT_LIMIT) => {
  try {
    const experiences = await experienceModel.findAll({ status: "active" });

    return experiences
      .map((e) => ({ ...e, _score: scoreExperience(e) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  } catch (err) {
    logger.error(`[RecommendationService] getTrending failed: ${err.message}`);
    return [];
  }
};

// ─── 4. Similar Experiences ───────────────────────────────────────────────────

/**
 * Get experiences similar to a given experience (same tags or community region).
 * Used on the ExperienceDetails page.
 *
 * @param {object} experience   — the source experience object
 * @param {number} [limit]
 * @returns {Promise<object[]>}
 */
export const getSimilarExperiences = async (experience, limit = 4) => {
  try {
    const candidates = await experienceModel.findByTags(experience.tags || [], {
      status: "active",
    });

    return candidates
      .filter((e) => e.id !== experience.id)
      .map((e) => ({ ...e, _score: scoreExperience(e) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  } catch (err) {
    logger.error(`[RecommendationService] getSimilar failed: ${err.message}`);
    return [];
  }
};

// ─── 5. Personalised Home Feed ────────────────────────────────────────────────

/**
 * Build a mixed recommendation feed for the tourist dashboard / home page.
 * Combines interest-based, nearby, and trending into one de-duplicated list.
 *
 * @param {{
 *   userId:    string,
 *   interests: string[],
 *   location?: { lat: number, lng: number },
 *   limit?:    number,
 * }} params
 * @returns {Promise<object[]>}
 */
export const getPersonalisedFeed = async ({ userId, interests, location, limit = 12 }) => {
  try {
    const [interestBased, nearby, trending] = await Promise.all([
      getInterestBasedRecommendations(userId, interests, limit),
      location ? getNearbyExperiences(location, 150, Math.ceil(limit / 2)) : Promise.resolve([]),
      getTrendingExperiences(limit),
    ]);

    // Merge and de-duplicate by id, preserving priority order:
    // 1. Interest-based  2. Nearby  3. Trending
    const seen = new Set();
    const feed = [];

    for (const exp of [...interestBased, ...nearby, ...trending]) {
      if (!seen.has(exp.id) && feed.length < limit) {
        seen.add(exp.id);
        feed.push(exp);
      }
    }

    return feed;
  } catch (err) {
    logger.error(`[RecommendationService] getPersonalisedFeed failed: ${err.message}`);
    return [];
  }
};