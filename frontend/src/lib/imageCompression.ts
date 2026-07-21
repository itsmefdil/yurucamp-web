import { toast } from 'sonner';
import heic2any from 'heic2any';

const FINAL_SIZE_LIMIT_MB = 10; // Max size Cloudinary free tier can handle

const getJpegName = (fileName: string): string => {
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    return `${nameWithoutExt}.jpeg`;
};

// Helper function to perform canvas compression
const compressWithCanvas = (file: File, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const MAX_DIMS = 1280;
                let { width, height } = img;
                if (width > height && width > MAX_DIMS) {
                    height *= MAX_DIMS / width;
                    width = MAX_DIMS;
                } else if (height > MAX_DIMS) {
                    width *= MAX_DIMS / height;
                    height = MAX_DIMS;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("Could not get canvas context"));

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => {
                    if (!blob) return reject(new Error("Canvas to Blob failed"));
                    const finalFileName = file.name.endsWith('.jpeg') ? file.name : getJpegName(file.name);
                    resolve(new File([blob], finalFileName, { type: 'image/jpeg', lastModified: Date.now() }));
                }, 'image/jpeg', quality);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
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
            const conversionResult = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
            const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
            processedFile = new File([blob], getJpegName(file.name), { type: 'image/jpeg', lastModified: Date.now() });
        }

        // Step 2: Iterative compression to get under the final size limit
        let currentQuality = 0.8;
        const MIN_QUALITY = 0.1;
        const QUALITY_STEP_DOWN = 0.15;

        while (processedFile.size / 1024 / 1024 > FINAL_SIZE_LIMIT_MB && currentQuality >= MIN_QUALITY) {
            toast.loading(`File > ${FINAL_SIZE_LIMIT_MB}MB. Kompresi ulang... (Kualitas ${Math.round(currentQuality * 100)}%)`, { id: toastId });
            processedFile = await compressWithCanvas(processedFile, currentQuality);
            currentQuality -= QUALITY_STEP_DOWN;
        }

        // Step 3: Final size validation
        if (processedFile.size / 1024 / 1024 > FINAL_SIZE_LIMIT_MB) {
            console.error(`File is still too large after all compression attempts: ${(processedFile.size / 1024 / 1024).toFixed(2)} MB`);
            toast.error(`Gagal mengompres file di bawah ${FINAL_SIZE_LIMIT_MB}MB.`, { id: toastId, duration: 5000 });
            return null;
        }

        toast.success(`Gambar ${processedFile.name} siap di-upload! (${(processedFile.size / 1024 / 1024).toFixed(2)}MB)`, { id: toastId, duration: 4000 });
        return processedFile;

    } catch (error) {
        console.error("Image processing failed:", error);
        toast.error(`Gagal memproses gambar. Coba pilih file lain.`, { id: toastId, duration: 5000 });
        return null;
    }
}

