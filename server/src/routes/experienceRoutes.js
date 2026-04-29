import { Router } from 'express';
import {
  getExperiences,
  getExperienceBySlug,
  createExperience,
  updateExperience,
  updateExperienceCover,
  uploadExperienceImages,
  deleteExperience,
} from '../controllers/experienceController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize }    from '../middlewares/roleMiddleware.js';
import { validate }     from '../middlewares/validateRequest.js';
import { handleUpload, uploadMultiple, uploadSingle } from '../middlewares/uploadMiddleware.js';
import {
  createExperienceSchema,
  updateExperienceSchema,
} from '../validators/experienceValidator.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────
router.get('/',        getExperiences);
router.get('/:slug',   getExperienceBySlug);

// ── Community owner only ──────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('community'),
  validate(createExperienceSchema),
  createExperience
);

router.patch(
  '/:id',
  authenticate,
  authorize('community'),
  validate(updateExperienceSchema),
  updateExperience
);

router.patch(
  '/:id/cover',
  authenticate,
  authorize('community'),
  handleUpload(uploadSingle),
  updateExperienceCover
);

router.post(
  '/:id/images',
  authenticate,
  authorize('community'),
  handleUpload(uploadMultiple),
  uploadExperienceImages
);

router.delete(
  '/:id',
  authenticate,
  authorize('community'),
  deleteExperience
);

export default router;
