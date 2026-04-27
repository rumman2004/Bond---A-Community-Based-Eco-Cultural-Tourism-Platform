import { Router } from 'express';
import {
  uploadImage,
  uploadImages,
} from '../controllers/uploadController.js';
import { authenticate }  from '../middlewares/authMiddleware.js';
import { uploadSingle, uploadMultiple } from '../middlewares/uploadMiddleware.js';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// ── Single image ─────────────────────────────────────────────
// POST /api/upload?folder=avatars|communities|experiences|stories|reports
router.post('/image',   uploadSingle,   uploadImage);

// ── Multiple images (max 5) ───────────────────────────────────
// POST /api/upload/images?folder=communities|experiences|stories
router.post('/images',  uploadMultiple, uploadImages);

export default router;