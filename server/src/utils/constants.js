// ============================================================
// utils/constants.js
// Shared constant values referenced across controllers,
// validators, and middleware. Single source of truth.
// ============================================================

export const USER_ROLES = ['tourist', 'community', 'security', 'admin'];
export const PUBLIC_ROLES = ['tourist', 'community'];   // self-registerable

export const USER_STATUSES     = ['active', 'suspended', 'banned', 'pending'];
export const COMMUNITY_STATUSES = ['pending', 'verified', 'rejected', 'suspended'];
export const EXPERIENCE_STATUSES = ['draft', 'active', 'paused', 'archived'];
export const BOOKING_STATUSES   = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
export const STORY_STATUSES     = ['draft', 'published', 'archived'];
export const REPORT_STATUSES    = ['open', 'under_review', 'resolved', 'dismissed'];

export const EXPERIENCE_CATEGORIES = [
  'cultural', 'adventure', 'culinary', 'nature', 'craft',
  'spiritual', 'farming', 'festival', 'wildlife', 'trekking',
  'food', 'wellness', 'rural', 'heritage', 'art', 'eco',
  'photography', 'hiking', 'workshop', 'safari', 'homestay', 'history',
  'music', 'dance', 'sports', 'educational', 'volunteer'
];
export const EXPERIENCE_DIFFICULTIES = ['easy', 'moderate', 'challenging'];

export const REPORT_ENTITY_TYPES = ['community', 'experience', 'user', 'review', 'story'];

export const UPLOAD_FOLDERS = ['avatars', 'communities', 'experiences', 'stories', 'reports'];

export const MAX_UPLOAD_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PAGINATION_DEFAULTS = { page: 1, limit: 12 };
export const PAGINATION_MAX_LIMIT = 100;