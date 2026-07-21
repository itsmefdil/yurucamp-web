import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

/**
 * Compresses an image file if it exceeds a certain size.
 * @param file The image file to compress
 * @param maxSizeMB The maximum size in MB (default: 1)
 * @returns The compressed file or the original file if compression fails or isn't needed
 */
export async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
    if (file.size / 1024 / 1024 <= maxSizeMB) {
        console.log(`Image ${file.name} is already under ${maxSizeMB}MB, skipping compression.`);
        return file;
    }

    const toastId = toast.loading(`Mengompres gambar ${file.name}... (Kualitas Tinggi)`);

    const compressionAttempts = [
        {
            label: 'Kualitas Tinggi',
            options: {
                maxSizeMB: maxSizeMB,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            },
        },
        {
            label: 'Kualitas Medium',
            options: {
                maxSizeMB: maxSizeMB,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            },
        },
        {
            label: 'Kualitas Rendah',
            options: {
                maxSizeMB: maxSizeMB,
                maxWidthOrHeight: 800,
                useWebWorker: true,
                initialQuality: 0.5,
            },
        },
    ];

    for (const attempt of compressionAttempts) {
        toast.loading(`Mengompres gambar ${file.name}... (${attempt.label})`, { id: toastId });
        try {
            const compressedFile = await imageCompression(file, { ...attempt.options, fileType: file.type });
            const finalFile = new File([compressedFile], file.name, {
                type: compressedFile.type,
                lastModified: Date.now(),
            });

            console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB -> Compressed size: ${(finalFile.size / 1024 / 1024).toFixed(2)} MB`);
            toast.success(`Gambar ${file.name} berhasil dikompres!`, { id: toastId });
            return finalFile;
        } catch (error) {
            console.error(`Compression attempt (${attempt.label}) failed:`, error);
        }
    }

    // If all attempts fail
    toast.warning(`Gagal mengompres gambar ${file.name}. Mencoba upload file original... Ukuran mungkin terlalu besar.`, { id: toastId });
    return file; // Fallback to original
}
