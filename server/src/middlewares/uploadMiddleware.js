// ============================================================
// middlewares/uploadMiddleware.js
// Multer configuration for file uploads.
// Files are held in memory (buffer) and streamed directly to
// Cloudinary — no temp files written to disk.
// Install: npm install multer
//
// Three export variants used across routes:
//   uploadSingle   — one image  (avatar, cover, story cover)
//   uploadMultiple — up to 5 images  (gallery uploads)
//   uploadReport   — up to 3 images  (evidence attachments on reports)
//
// Usage in routes:
//   router.patch('/avatar',        protect, uploadSingle,   updateAvatar)
//   router.patch('/cover/:id',     protect, uploadSingle,   updateCoverImage)
//   router.post('/upload',         protect, uploadMultiple, uploadImages)
//
// Controllers that use req.file  → uploadSingle
// Controllers that use req.files → uploadMultiple / uploadReport
// ============================================================

import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

// ── Allowed MIME types ────────────────────────────────────────
const ALLOWED_MIME_TYPES      = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_DOC_MIME_TYPES  = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE_MB        = 5;
const MAX_DOC_SIZE_MB         = 10;

// ── Storage: memory (no disk writes) ─────────────────────────
const storage = multer.memoryStorage();

// ── File filter ───────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true); // accept
  } else {
    cb(
      new ApiError(400, `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`),
      false
    );
  }
};

// ── Base multer instance (images only) ──────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

// ── Document file filter (PDF + common image types) ──────────
const docFileFilter = (req, file, cb) => {
  if (ALLOWED_DOC_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, `Invalid file type. Allowed: PDF, JPG, PNG`),
      false
    );
  }
};

// ── Document multer instance (PDF, 10 MB) ────────────────────
const uploadDoc = multer({
  storage,
  fileFilter: docFileFilter,
  limits: {
    fileSize: MAX_DOC_SIZE_MB * 1024 * 1024,
  },
});

// ── uploadSingle ──────────────────────────────────────────────
// Accepts one file in the 'image' field.
// Sets req.file — used by:
//   userController.updateAvatar
//   communityController.updateCoverImage
//   experienceController.updateExperienceCover
//   storyController.updateStoryCover
export const uploadSingle = upload.single('image');

// ── uploadMultiple ────────────────────────────────────────────
// Accepts up to 5 files in the 'images' field.
// Sets req.files — used by:
//   uploadController.uploadImages
export const uploadMultiple = upload.array('images', 5);

// ── uploadReport ──────────────────────────────────────────────
// Accepts up to 3 evidence images in the 'evidence' field.
// Sets req.files — available for report submissions if needed.
export const uploadReport = upload.array('evidence', 3);

// ── uploadDocument ────────────────────────────────────────────
// Accepts multiple PDF (or images) in the 'document' field.
// Max 10 MB per file. Used by:
//   communityVerificationController.uploadCommunityDocument
export const uploadDocument = uploadDoc.array('document', 10);

// ── uploadOfferingImages ──────────────────────────────────────
// Accepts up to 5 images in the 'images' field.
// Used by:
//   communityVerificationController.uploadOfferingImages
export const uploadOfferingImages = upload.array('images', 5);

// ── Error wrapper ─────────────────────────────────────────────
// Multer errors don't go through asyncHandler automatically.
// Wrap any of the exports above with this to get clean ApiError
// responses instead of Express's default multer error format.
//
// Usage:
//   router.patch('/avatar', protect, handleUpload(uploadSingle), updateAvatar)
export const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE:       `File too large. Maximum ${MAX_FILE_SIZE_MB}MB allowed`,
        LIMIT_FILE_COUNT:      'Too many files. Check the maximum allowed',
        LIMIT_UNEXPECTED_FILE: 'Unexpected field name in form data',
      };
      return next(new ApiError(400, messages[err.code] ?? 'File upload error'));
    }

    // fileFilter rejection or other error
    return next(err instanceof ApiError ? err : new ApiError(400, err.message));
  });
};