import { useState } from "react";
import uploadService from "../services/uploadService";

export default function useUploadImage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    setUploading(true);
    setError(null);
    try {
      return await uploadService.uploadImage(file);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
}
