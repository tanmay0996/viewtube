import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("localFilePath not found :("); // Log error if localFilePath is missing
            return null;
        }

        // Upload file to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' });

        /*
        uploadResponse object includes multiple fields, such as:
        {
          "public_id": "unique-id-generated-by-cloudinary",
          "url": "https://res.cloudinary.com/.../file-url",
          "secure_url": "https://.../secure-file-url",
          "resource_type": "video",
          "duration": 120.5,
          ...
        }
        */

        // Clean up the locally saved temp file (stored on the server) as the upload operation succeeded
        fs.unlinkSync(localFilePath);

        return uploadResponse; // Return the response from Cloudinary

    } catch (error) {
        try {
            // Attempt to remove the locally saved temp file (stored on the server) as the upload operation failed
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (cleanupError) {
            console.error("Failed to clean up local file:", cleanupError); // Log cleanup error if unlink fails
        }

        console.error("Cloudinary upload failed:", error); // Log the upload error
        return null;
    }
};

// Function to delete a file from Cloudinary
const deleteOnCloudinary = async (public_id, resource_type = "image") => {
    try {
        if (!public_id) {
            console.error("public_id is required for deletion"); // Log error if public_id is missing
            return null;
        }

        // Delete the file on Cloudinary
        const result = await cloudinary.uploader.destroy(public_id, { resource_type });

        return result; // Return the result of the deletion

    } catch (error) {
        console.error("Delete on Cloudinary failed:", error); // Log the deletion error
        return null;
    }
};

export { uploadOnCloudinary, deleteOnCloudinary };
