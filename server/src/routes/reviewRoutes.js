import { Router } from 'express';
import {
  getExperienceReviews,
  createReview,
  updateReview,
  deleteReview,
  hideReview,
} from '../controllers/reviewController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';
import { validate }     from '../middlewares/validateRequest.js';
import {
  createReviewSchema,
  updateReviewSchema,
} from '../validators/reviewValidator.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────
// GET /api/reviews/experience/:experience_id
router.get('/experience/:experience_id', getExperienceReviews);

// ── Tourist ───────────────────────────────────────────────────
router.post  ('/',    authenticate, authorize('tourist'), validate(createReviewSchema), createReview);
router.patch ('/:id', authenticate, authorize('tourist'), validate(updateReviewSchema), updateReview);
router.delete('/:id', authenticate, authorize('tourist'), deleteReview);

// ── Moderation (security + admin) ─────────────────────────────
router.patch('/:id/hide', authenticate, authorize('security', 'admin'), hideReview);

export default router;