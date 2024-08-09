import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const base64ToBuffer = (base64: any) =>
  Buffer.from(base64.split(",")[1], "base64");

export const ImageUpload = async (base64Image: string) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  try {
    const imageBuffer = base64ToBuffer(base64Image);

    if (imageBuffer.length > MAX_SIZE) {
      throw new Error("Image size exceeds the 5MB limit");
    }

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "e-financer",
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    });
    console.log(`Successfully uploaded image`);
    return result.secure_url;
  } catch (error) {
    if (error.message.includes("Image size exceeds")) {
      console.error(error.message);
      throw new Error(error.message);
    }
    console.error("Error uploading", error);
    throw new Error(`Image upload failed: ${error}`);
  }
};
