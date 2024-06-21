import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const ImageUpload = async (base64Image: string) => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "e-financer",
    });
    console.log(`Successfully uploaded image`);
    // console.log(`> Result: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading", error);
    throw new Error("Image upload failed");
  }
};
