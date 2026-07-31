import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { config } from "../config/config.mjs";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: config.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY,
  api_secret: config.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET,
});

export const uploadPdfBufferToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // Cloudinary automatically detects PDFs
        folder: "medcore/lab_reports",
        public_id: filename
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
