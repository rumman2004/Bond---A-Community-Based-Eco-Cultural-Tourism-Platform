import { uploadToCloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Allowed folders per use-case
const ALLOWED_FOLDERS = ['avatars', 'communities', 'experiences', 'stories', 'reports'];

// ─── Upload single image ──────────────────────────────────────
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided');

  const folder = req.query.folder || 'general';
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new ApiError(400, `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}`);
  }

  const uploaded = await uploadToCloudinary(req.file.buffer, folder);

  res.status(201).json(new ApiResponse(201, {
    url:       uploaded.secure_url,
    public_id: uploaded.public_id,
    width:     uploaded.width,
    height:    uploaded.height,
    format:    uploaded.format,
    bytes:     uploaded.bytes,
  }, 'Image uploaded'));
});

// ─── Upload multiple images ───────────────────────────────────
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, 'No files provided');
  if (req.files.length > 5) throw new ApiError(400, 'Maximum 5 images allowed per upload');

  const folder = req.query.folder || 'general';
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new ApiError(400, `Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}`);
  }

  const uploads = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer, folder))
  );

  const results = uploads.map((u) => ({
    url:       u.secure_url,
    public_id: u.public_id,
    width:     u.width,
    height:    u.height,
    format:    u.format,
    bytes:     u.bytes,
  }));

  res.status(201).json(new ApiResponse(201, { images: results }, `${results.length} images uploaded`));
});