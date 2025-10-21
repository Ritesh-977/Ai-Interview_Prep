import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer to upload
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} - The Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // We use upload_stream to upload a buffer
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'ai-interview-prep', // Folder in Cloudinary
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    // Write the buffer to the stream to start the upload
    stream.end(buffer);
  });
};

// Export the config and the new function
export { cloudinary, uploadToCloudinary };