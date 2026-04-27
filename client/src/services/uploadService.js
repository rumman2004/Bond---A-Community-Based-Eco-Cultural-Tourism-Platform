import api from "./api";

// SERVER routes (uploadRoutes.js):
//   POST /upload/image   ?folder=avatars|communities|experiences|stories|documents
//   POST /upload/images  ?folder=communities|experiences|stories  (max 5 files)

// Valid folder values — match your server's uploadService.js FOLDERS map
export const UPLOAD_FOLDERS = {
  AVATAR:     "avatars",
  COMMUNITY:  "communities",
  EXPERIENCE: "experiences",
  STORY:      "stories",
  DOCUMENT:   "documents",
};

const uploadService = {
  /**
   * Upload a single image file.
   * @param {File}   file
   * @param {string} folder — use UPLOAD_FOLDERS constants
   * @returns {{ url: string, publicId: string }}
   *
   * Was: no folder param passed ❌
   * Now: POST /upload/image?folder=... ✓
   */
  uploadImage(file, folder = UPLOAD_FOLDERS.COMMUNITY) {
    const formData = new FormData();
    formData.append("image", file);
    return api.post(`/upload/image?folder=${folder}`, formData);
  },

  /**
   * Upload multiple images at once (max 5).
   * Was: missing ❌
   * Now: POST /upload/images?folder=... ✓
   *
   * @param {File[]} files
   * @param {string} folder — use UPLOAD_FOLDERS constants
   * @returns {Array<{ url: string, publicId: string }>}
   */
  uploadImages(files, folder = UPLOAD_FOLDERS.EXPERIENCE) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post(`/upload/images?folder=${folder}`, formData);
  },
};

export default uploadService;