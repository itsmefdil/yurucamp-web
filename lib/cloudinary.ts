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
                    { width: 1920, crop: 'scale' },
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

export async function getRandomImages(count: number = 5, folder: string = 'camp_areas'): Promise<string[]> {
    try {
        const result = await cloudinary.search
            .expression(`folder:${folder} AND resource_type:image`)
            .sort_by('created_at', 'desc')
            .max_results(count * 3) // Fetch more to allow for better randomization
            .execute();

        if (!result || !result.resources) {
            console.log("No resources found in Cloudinary search");
            return [];
        }

        const resources = result.resources;
        // Shuffle and pick count
        const shuffled = resources.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map((res: any) => res.secure_url);
    } catch (error) {
        console.error("Error fetching random images from Cloudinary:", error);
        return [];
    }
}
