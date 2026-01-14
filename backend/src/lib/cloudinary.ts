import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection by pinging the API
cloudinary.api.ping()
    .then(() => {
        console.log('✅ Cloudinary connected successfully');
    })
    .catch((error) => {
        console.error('❌ Cloudinary connection failed:', error.message);
    });

export async function uploadImage(file: Express.Multer.File, folder?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: process.env.CLOUDINARY_PATH_PREFIX ? `${process.env.CLOUDINARY_PATH_PREFIX}/${folder}` : folder,
                transformation: [
                    { width: 800, crop: 'scale' },
                    { quality: 'auto', fetch_format: 'auto' }
                ],
                timeout: 120000 // 2 minutes
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    if (result?.secure_url) {
                        resolve(result.secure_url);
                    } else {
                        resolve('');
                    }
                }
            }
        ).end(file.buffer);
    });
}

export async function deleteImage(publicId: string): Promise<void> {
    console.log("Attempting to delete image with publicId:", publicId);
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            console.log("Cloudinary destroy result:", result);
            if (error) {
                console.error("Cloudinary destroy error:", error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export function getPublicIdFromUrl(url: string): string | null {
    try {
        // Cloudinary URL format: 
        // https://res.cloudinary.com/[cloud_name]/[resource_type]/[type]/[transformations]/v[version]/[public_id].[extension]

        // Remove query parameters
        const urlWithoutQuery = url.split('?')[0];

        // Parts of the path after 'upload/' (typical for our usage)
        const parts = urlWithoutQuery.split('/upload/');
        if (parts.length < 2) return null;

        const publicIdPath = parts[1];
        // Remove version if present (v12345678)
        const pathNoVersion = publicIdPath.replace(/^v\d+\//, '');

        // Remove extension
        const lastDotIndex = pathNoVersion.lastIndexOf('.');
        if (lastDotIndex === -1) return pathNoVersion;

        return pathNoVersion.substring(0, lastDotIndex);
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
}
