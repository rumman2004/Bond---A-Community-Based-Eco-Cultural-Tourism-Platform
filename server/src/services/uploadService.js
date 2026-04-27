import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { cloudinaryConfig } from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

// Ensure cloudinary is configured (calls cloudinary.config() from your config file)
cloudinaryConfig();

// ─── Folder Map ───────────────────────────────────────────────────────────────
// Keeps all Bond assets organised in Cloudinary under a single root folder.

const FOLDERS = {
  AVATAR:      "bond/avatars",
  COMMUNITY:   "bond/communities",
  EXPERIENCE:  "bond/experiences",
  STORY:       "bond/stories",
  DOCUMENT:    "bond/documents",
};

// ─── Core Upload Helper ───────────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudinary via a readable stream.
 * Used internally by all upload helpers.
 *
 * @param {Buffer}  buffer      — file buffer from Multer (req.file.buffer)
 * @param {string}  folder      — Cloudinary folder path
 * @param {object}  [options]   — extra Cloudinary upload options
 * @returns {Promise<object>}   Cloudinary upload result
 */
const uploadBuffer = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        max_bytes: 5 * 1024 * 1024, // 5 MB
        ...options,
      },
      (err, result) => {
        if (err) {
          logger.error(`[UploadService] Cloudinary upload failed: ${err.message}`);
          return reject(new ApiError(500, "File upload failed. Please try again."));
        }
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

// ─── Delete Helper ────────────────────────────────────────────────────────────

/**
 * Delete an asset from Cloudinary by its public_id.
 * Safe to call even if the asset doesn't exist (logs warning, doesn't throw).
 *
 * @param {string} publicId — Cloudinary public_id (stored in your DB)
 */
export const deleteFile = async (publicId) => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not found") {
      logger.warn(`[UploadService] Unexpected destroy result for ${publicId}: ${result.result}`);
    }
  } catch (err) {
    logger.error(`[UploadService] Failed to delete ${publicId}: ${err.message}`);
  }
};

// ─── Domain-specific Uploaders ────────────────────────────────────────────────

/**
 * Upload a user avatar.
 * Applies face-aware cropping and auto-quality optimisation.
 *
 * @param {Buffer} buffer
 * @param {string} userId  — used as the public_id so re-uploads overwrite the old one
 * @returns {{ url: string, publicId: string }}
 */
export const uploadAvatar = async (buffer, userId) => {
  const result = await uploadBuffer(buffer, FOLDERS.AVATAR, {
    public_id:      `avatar_${userId}`,
    overwrite:      true,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Upload a community cover image.
 *
 * @param {Buffer} buffer
 * @param {string} communityId
 * @returns {{ url: string, publicId: string }}
 */
export const uploadCommunityImage = async (buffer, communityId) => {
  const result = await uploadBuffer(buffer, FOLDERS.COMMUNITY, {
    public_id:      `community_${communityId}_${Date.now()}`,
    transformation: [
      { width: 1200, height: 630, crop: "fill" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Upload one or more experience images.
 * Pass an array of buffers; returns an array of { url, publicId }.
 *
 * @param {Buffer[]} buffers
 * @param {string}   experienceId
 * @returns {Promise<Array<{ url: string, publicId: string }>>}
 */
export const uploadExperienceImages = async (buffers, experienceId) => {
  const uploads = buffers.map((buffer, idx) =>
    uploadBuffer(buffer, FOLDERS.EXPERIENCE, {
      public_id:      `experience_${experienceId}_${idx}_${Date.now()}`,
      transformation: [
        { width: 1000, height: 700, crop: "fill" },
        { quality: "auto:good", fetch_format: "auto" },
      ],
    })
  );
  const results = await Promise.all(uploads);
  return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
};

/**
 * Upload a story cover image (wider aspect ratio, editorial feel).
 *
 * @param {Buffer} buffer
 * @param {string} storyId
 * @returns {{ url: string, publicId: string }}
 */
export const uploadStoryImage = async (buffer, storyId) => {
  const result = await uploadBuffer(buffer, FOLDERS.STORY, {
    public_id:      `story_${storyId}_${Date.now()}`,
    transformation: [
      { width: 1400, height: 700, crop: "fill", gravity: "auto" },
      { quality: "auto:best", fetch_format: "auto" },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Upload a verification document (PDF or image, no transformation applied).
 * Higher size limit (10 MB).
 *
 * @param {Buffer} buffer
 * @param {string} communityId
 * @returns {{ url: string, publicId: string }}
 */
export const uploadVerificationDocument = async (buffer, communityId) => {
  const result = await uploadBuffer(buffer, FOLDERS.DOCUMENT, {
    public_id:      `doc_${communityId}_${Date.now()}`,
    resource_type:  "auto",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    max_bytes:      10 * 1024 * 1024,
  });
  return { url: result.secure_url, publicId: result.public_id };
};

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Generate an on-the-fly optimised URL from an existing Cloudinary public_id.
 * Useful for serving thumbnails without storing multiple sizes.
 *
 * @param {string} publicId
 * @param {{ width?, height?, crop? }} [opts]
 * @returns {string} optimised Cloudinary URL
 */
export const getOptimisedUrl = (publicId, opts = {}) => {
  return cloudinary.url(publicId, {
    secure:       true,
    quality:      "auto",
    fetch_format: "auto",
    ...opts,
  });
};