import { toast } from 'sonner';
import heic2any from 'heic2any';

const FINAL_SIZE_LIMIT_MB = 10; // Max size Cloudinary free tier can handle

const getJpegName = (fileName: string): string => {
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    return `${nameWithoutExt}.jpeg`;
};

// Helper function to perform canvas compression safely
// Uses createImageBitmap (zero-copy, hardware-decoded) to avoid Base64 RAM explosion on Android Chrome.
const compressWithCanvas = (file: File, quality: number, maxDimension = 1600): Promise<File> => {
    return new Promise(async (resolve, reject) => {
        let objectUrl: string | null = null;
        try {
            let width: number;
            let height: number;
            let drawSource: CanvasImageSource;

            // createImageBitmap: hardware-decoded, no Base64 string in RAM — safe on Android Chrome
            if ('createImageBitmap' in window) {
                const bitmap = await createImageBitmap(file);
                width = bitmap.width;
                height = bitmap.height;
                drawSource = bitmap;
            } else {
                // Fallback: use object URL instead of data URL to avoid Base64 conversion
                objectUrl = URL.createObjectURL(file);
                const img = new Image();
                img.src = objectUrl;
                await new Promise<void>((res, rej) => {
                    img.onload = () => res();
                    img.onerror = () => rej(new Error("Gagal membaca data gambar"));
                });
                width = img.width;
                height = img.height;
                drawSource = img;
            }

            if (width > height && width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
            } else if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                return reject(new Error("Could not get canvas context"));
            }

            ctx.drawImage(drawSource, 0, 0, width, height);

            // Free ImageBitmap memory immediately after drawing
            if ('close' in drawSource && typeof (drawSource as any).close === 'function') {
                (drawSource as any).close();
            }

            canvas.toBlob(blob => {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                if (!blob) return reject(new Error("Canvas to Blob failed"));
                const finalFileName = file.name.endsWith('.jpeg') || file.name.endsWith('.jpg') ? file.name : getJpegName(file.name);
                resolve(new File([blob], finalFileName, { type: 'image/jpeg', lastModified: Date.now() }));
            }, 'image/jpeg', quality);
        } catch (err) {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            reject(err);
        }
    });
};


/**
 * Compresses and validates an image file. It will iteratively compress the image
 * to meet the FINAL_SIZE_LIMIT_MB.
 * @param file The image file to process
 * @returns The processed file, or null if it's too large after processing.
 */
export async function processImageForUpload(file: File): Promise<File | null> {
    const toastId = toast.loading(`Mempersiapkan gambar ${file.name}...`);

    try {
        let processedFile = file;

        // Step 1: Handle HEIC/HEIF conversion
        const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.heic$|\.heif$/i.test(file.name);
        if (isHeic) {
            toast.loading(`Mengonversi file HEIC...`, { id: toastId });
            try {
                const conversionResult = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
                const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
                processedFile = new File([blob], getJpegName(file.name), { type: 'image/jpeg', lastModified: Date.now() });
            } catch (heicError) {
                console.error("HEIC conversion failed:", heicError);
                toast.error(`Format HEIC gagal dikonversi di browser ini. Mohon gunakan format JPG/PNG.`, { id: toastId, duration: 5000 });
                return null;
            }
        }

        // Step 2: Canvas compression (Start with max dimension 1600 & 0.8 quality for mobile optimization)
        toast.loading(`Mengompresi gambar ${file.name}...`, { id: toastId });
        processedFile = await compressWithCanvas(processedFile, 0.8, 1600);

        // Step 3: Iterative compression if still larger than target limit
        let currentQuality = 0.65;
        let currentMaxDim = 1200;
        const MIN_QUALITY = 0.2;

        while (processedFile.size / 1024 / 1024 > FINAL_SIZE_LIMIT_MB && currentQuality >= MIN_QUALITY) {
            toast.loading(`Ukuran file > ${FINAL_SIZE_LIMIT_MB}MB. Kompresi ulang...`, { id: toastId });
            processedFile = await compressWithCanvas(processedFile, currentQuality, currentMaxDim);
            currentQuality -= 0.15;
            currentMaxDim = Math.max(800, currentMaxDim - 200);
        }

        // Step 4: Final size validation
        if (processedFile.size / 1024 / 1024 > FINAL_SIZE_LIMIT_MB) {
            console.error(`File is still too large after all compression attempts: ${(processedFile.size / 1024 / 1024).toFixed(2)} MB`);
            toast.error(`Gagal mengompres file di bawah ${FINAL_SIZE_LIMIT_MB}MB.`, { id: toastId, duration: 5000 });
            return null;
        }

        toast.success(`Gambar ${processedFile.name} siap di-upload! (${(processedFile.size / 1024 / 1024).toFixed(2)}MB)`, { id: toastId, duration: 3000 });
        return processedFile;

    } catch (error) {
        console.error("Image processing failed:", error);
        toast.error(`Gagal memproses gambar. Silakan coba file gambar lain.`, { id: toastId, duration: 5000 });
        return null;
    }
}

