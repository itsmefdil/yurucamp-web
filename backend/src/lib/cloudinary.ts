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

/**
 * Folder that a user's uploads go into. Every upload is scoped to the uploader's id so the
 * server can later verify that an image URL submitted by a client was uploaded by that client.
 */
export function userUploadFolder(subfolder: string, userId: string): string {
    const folder = `${subfolder}/${userId}`;
    return process.env.CLOUDINARY_PATH_PREFIX ? `${process.env.CLOUDINARY_PATH_PREFIX}/${folder}` : folder;
}

export async function uploadImage(file: Express.Multer.File, folder: string, userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: userUploadFolder(folder, userId),
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

function cloudinaryUploadPrefix(): string | null {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    return cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/` : null;
}

/**
 * Extracts the public id of an image hosted in OUR Cloudinary account.
 * Returns null for any other URL, so callers never act on foreign images.
 */
export function getPublicIdFromUrl(url: string): string | null {
    try {
        const prefix = cloudinaryUploadPrefix();
        if (!prefix || typeof url !== 'string' || !url.startsWith(prefix)) return null;

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

/** True when `url` points at an image in our Cloudinary account that `userId` uploaded. */
export function isUploadedBy(url: string, userId: string): boolean {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId || !userId) return false;
    // Public id looks like `[prefix/]<folder>/<userId>/<name>`
    return publicId.split('/').slice(0, -1).includes(String(userId));
}

/**
 * Validates image URLs sent by a client. Each URL must either already be attached to the
 * record being edited (`existing`) or have been uploaded by the requesting user. This stops a
 * user from attaching someone else's image to their own record and later getting it deleted.
 */
export function areImageUrlsAllowed(
    urls: unknown[],
    userId: string,
    existing: (string | null | undefined)[] = []
): boolean {
    const existingSet = new Set(existing.filter((u): u is string => typeof u === 'string' && u.length > 0));
    return urls.every((url) => {
        if (url === null || url === undefined || url === '') return true;
        if (typeof url !== 'string') return false;
        return existingSet.has(url) || isUploadedBy(url, userId);
    });
}
