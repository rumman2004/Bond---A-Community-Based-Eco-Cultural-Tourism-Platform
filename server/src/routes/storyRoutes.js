import { Router } from 'express';
import {
  getStories,
  getStoryBySlug,
  getMyCommunityStories,
  createStory,
  updateStory,
  updateStoryCover,
  deleteStory,
} from '../controllers/storyController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = Router();

// ── Community owner (MUST be before /:slug to avoid conflict) ─
// GET /api/stories/me/all  would be caught by /:slug if registered after
router.get(
  '/me/all',
  authenticate,
  authorize('community'),
  getMyCommunityStories
);

// ── Public ────────────────────────────────────────────────────
router.get('/', getStories);

router.post(
  '/',
  authenticate,
  authorize('community'),
  createStory
);

router.patch(
  '/:id',
  authenticate,
  authorize('community'),
  updateStory
);

router.patch(
  '/:id/cover',
  authenticate,
  authorize('community'),
  uploadSingle,
  updateStoryCover
);

router.delete(
  '/:id',
  authenticate,
  authorize('community'),
  deleteStory
);

// ── Public slug route LAST — catches any :slug that didn't match above ──
router.get('/:slug', getStoryBySlug);

export default router;