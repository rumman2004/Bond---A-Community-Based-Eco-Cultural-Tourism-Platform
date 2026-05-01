import { Router } from 'express';
import {
  getCommunities,
  getCommunityBySlug,
  getOwnCommunity,
  createCommunity,
  updateCommunity,
  updateCoverImage,
  uploadCommunityImages,
  deleteCommunityImage,
  updateSustainabilityTags,
  getCommunityStats,
} from '../controllers/communityController.js';
import {
  getVerificationData,
  saveCommunityMembers,
  uploadCommunityDocument,
  saveCommunityOfferings,
  uploadOfferingImages,
  recordConsent,
} from '../controllers/communityVerificationController.js';
import { authenticate }  from '../middlewares/authMiddleware.js';
import { authorize }     from '../middlewares/roleMiddleware.js';
import { validate }      from '../middlewares/validateRequest.js';
import {
  uploadSingle,
  uploadMultiple,
  uploadDocument,
  uploadOfferingImages as multerOfferingImages,
  handleUpload,
} from '../middlewares/uploadMiddleware.js';
import {
  createCommunitySchema,
  updateCommunitySchema,
  sustainabilityTagsSchema,
} from '../validators/communityValidator.js';
import {
  membersSchema,
  offeringsSchema,
  consentSchema,
} from '../validators/communityVerificationValidator.js';

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
  handleUpload(uploadSingle),
  updateCoverImage
);

router.post(
  '/:id/images',
  authenticate,
  authorize('community'),
  handleUpload(uploadMultiple),
  uploadCommunityImages
);

router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('community'),
  deleteCommunityImage
);

router.patch(
  '/:id/tags',
  authenticate,
  authorize('community'),
  validate(sustainabilityTagsSchema),
  updateSustainabilityTags
);

// ── Verification wizard routes (owner only) ───────────────────
// GET full verification data (owner + security can both use this)
router.get(
  '/:id/verification',
  authenticate,
  authorize('community', 'security', 'admin'),
  getVerificationData
);

// Step 2A — save team members list
router.post(
  '/:id/members',
  authenticate,
  authorize('community'),
  validate(membersSchema),
  saveCommunityMembers
);

// Step 2B — upload ID bundle PDF
router.post(
  '/:id/documents',
  authenticate,
  authorize('community'),
  handleUpload(uploadDocument),
  uploadCommunityDocument
);

// Step 3A — save offerings
router.post(
  '/:id/offerings',
  authenticate,
  authorize('community'),
  validate(offeringsSchema),
  saveCommunityOfferings
);

// Step 3B — upload images for a specific offering
router.post(
  '/:id/offerings/:oid/images',
  authenticate,
  authorize('community'),
  handleUpload(multerOfferingImages),
  uploadOfferingImages
);

// Step 4 — record consent / T&C acceptance
router.post(
  '/:id/consent',
  authenticate,
  authorize('community'),
  validate(consentSchema),
  recordConsent
);

export default router;
