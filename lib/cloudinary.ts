import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dgks398q1',
    api_key: '844677445925417',
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File, folder?: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: folder,
                transformation: [
                    { width: 1024, crop: 'scale' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
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
        ).end(buffer);
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
        console.log("Extracting public ID from URL:", url);
        // Remove query parameters if present
        const urlWithoutQuery = url.split('?')[0];

        // Regex to capture public ID after version number (v12345...) and before extension
        // Supports URLs with or without transformations
        const regex = /\/v\d+\/(.+?)(\.[a-zA-Z0-9]+)?$/;
        const match = urlWithoutQuery.match(regex);

        if (match && match[1]) {
            console.log("Extracted public ID:", match[1]);
            return match[1];
        }

        console.log("Failed to extract public ID with regex");
        return null;
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
}
