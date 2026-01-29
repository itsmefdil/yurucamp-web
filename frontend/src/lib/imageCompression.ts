import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

/**
 * Compresses an image file if it exceeds a certain size.
 * @param file The image file to compress
 * @param maxSizeMB The maximum size in MB (default: 1)
 * @returns The compressed file or the original file if compression fails or isn't needed
 */
export async function compressImage(file: File, maxSizeMB: number = 3): Promise<File> {
    // If file is already smaller than the limit, return it
    if (file.size / 1024 / 1024 <= maxSizeMB) {
        return file;
    }

    const options = {
        maxSizeMB: maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type as string,
    };

    try {
        const compressedFile = await imageCompression(file, options);
        // Ensure we don't lose the original file name
        const finalFile = new File([compressedFile], file.name, {
            type: compressedFile.type,
            lastModified: Date.now(),
        });

        return finalFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        toast.warning(`Gagal mengompres gambar ${file.name}, mencoba upload original...`);
        return file;
    }
}
