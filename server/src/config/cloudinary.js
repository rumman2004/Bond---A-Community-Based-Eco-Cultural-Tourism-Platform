import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer  - File buffer from multer memoryStorage
 * @param {string} folder      - Cloudinary folder (e.g. 'communities', 'experiences')
 * @param {object} options     - Extra Cloudinary upload options
 * @returns {Promise<object>}  - Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, folder = 'general', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:         `bond/${folder}`,
        resource_type:  'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto:best', fetch_format: 'auto', flags: 'preserve_transparency' }],
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload error: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public_id
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary delete: ${publicId} — ${result.result}`);
    return result;
  } catch (err) {
    logger.error(`Cloudinary delete error: ${err.message}`);
    throw err;
  }
};

/**
 * Extract public_id from a Cloudinary URL
 * e.g. https://res.cloudinary.com/demo/image/upload/v123/bond/communities/abc.jpg
 * returns: bond/communities/abc
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  // Skip version segment (v1234567) if present
  const afterUpload = parts.slice(uploadIndex + 1);
  const start = afterUpload[0]?.startsWith('v') ? 1 : 0;
  const withExt = afterUpload.slice(start).join('/');
  return withExt.replace(/\.[^/.]+$/, ''); // strip extension
};

export default cloudinary;