import { toast } from 'sonner';
import heic2any from 'heic2any';

/**
 * Converts a file name to a JPEG extension.
 * e.g., "image.heic" -> "image.jpeg"
 */
const getJpegName = (fileName: string): string => {
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    return `${nameWithoutExt}.jpeg`;
};

/**
 * Compresses an image file using native browser Canvas API.
 * Handles HEIC/HEIF conversion and provides a stable compression method.
 * @param file The image file to compress
 * @param maxSizeMB The maximum size in MB (default: 2)
 * @returns The compressed file or the original file if compression fails or isn't needed
 */
export async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
    const toastId = toast.loading(`Mempersiapkan gambar ${file.name}...`);

    let processedFile = file;

    try {
        // Step 1: Handle HEIC/HEIF conversion if necessary
        const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.heic$|\.heif$/i.test(file.name);
        if (isHeic) {
            toast.loading(`Mengonversi file HEIC: ${file.name}...`, { id: toastId });
            const conversionResult = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8,
            });
            const blob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
            processedFile = new File([blob], getJpegName(file.name), {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
            console.log(`HEIC converted to JPEG: ${processedFile.name}`);
        }

        // Step 2: Check size AFTER potential conversion
        if (processedFile.size / 1024 / 1024 <= maxSizeMB) {
            toast.dismiss(toastId);
            console.log(`Image ${processedFile.name} is already under ${maxSizeMB}MB.`);
            return processedFile;
        }

        // Step 3: Compress with Canvas API
        toast.loading(`Mengompres gambar ${processedFile.name}...`, { id: toastId });
        const compressed = await new Promise<File>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(processedFile);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const MAX_WIDTH = 1280;
                    const MAX_HEIGHT = 1280;
                    let { width, height } = img;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject(new Error("Could not get canvas context"));

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) return reject(new Error("Canvas to Blob conversion failed"));
                            const finalFileName = processedFile.name.endsWith('.jpeg') ? processedFile.name : getJpegName(processedFile.name);
                            resolve(new File([blob], finalFileName, { type: 'image/jpeg', lastModified: Date.now() }));
                        },
                        'image/jpeg',
                        0.7 // Quality
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });

        console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)} MB -> Compressed: ${(compressed.size / 1024 / 1024).toFixed(2)} MB`);
        toast.success(`Gambar ${compressed.name} berhasil dioptimasi!`, { id: toastId });
        return compressed;

    } catch (error) {
        console.error("Image processing failed:", error);
        toast.warning(`Gagal memproses gambar. Mengunggah file original jika memungkinkan...`, { id: toastId });
        return file; // Fallback to the very original file
    }
}

