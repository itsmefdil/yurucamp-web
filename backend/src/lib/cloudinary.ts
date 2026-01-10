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
        // Remove query parameters if present
        const urlWithoutQuery = url.split('?')[0];
        const regex = /\/v\d+\/(.+?)(\.[a-zA-Z0-9]+)?$/;
        const match = urlWithoutQuery.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
}
