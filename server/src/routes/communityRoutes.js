import { Router } from 'express';
import {
  getCommunities,
  getCommunityBySlug,
  getOwnCommunity,
  createCommunity,
  updateCommunity,
  updateCoverImage,
  updateSustainabilityTags,
  getCommunityStats,
} from '../controllers/communityController.js';
import { authenticate }  from '../middlewares/authMiddleware.js';
import { authorize }     from '../middlewares/roleMiddleware.js';
import { validate }      from '../middlewares/validateRequest.js';
import { uploadSingle }  from '../middlewares/uploadMiddleware.js';
import {
  createCommunitySchema,
  updateCommunitySchema,
  sustainabilityTagsSchema,
} from '../validators/communityValidator.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────
router.get('/', getCommunities);

// ── Community owner only (MUST be before /:slug) ──────────────
router.get(
  '/me',
  authenticate,
  authorize('community'),
  getOwnCommunity
);

router.get(
  '/me/stats',
  authenticate,
  authorize('community'),
  getCommunityStats
);

// ── Wildcard — must be last among GETs ───────────────────────
router.get('/:slug', getCommunityBySlug);

// ── Community owner mutations ─────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('community'),
  validate(createCommunitySchema),
  createCommunity
);

router.patch(
  '/:id',
  authenticate,
  authorize('community'),
  validate(updateCommunitySchema),
  updateCommunity
);

router.patch(
  '/:id/cover',
  authenticate,
  authorize('community'),
  uploadSingle,
  updateCoverImage
);

router.patch(
  '/:id/tags',
  authenticate,
  authorize('community'),
  validate(sustainabilityTagsSchema),
  updateSustainabilityTags
);

export default router;