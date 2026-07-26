import api from './api';
import { processImageForUpload } from './imageCompression';

interface UploadOptions {
    folder: string;
    onProgress?: (progressPercent: number) => void;
    maxRetries?: number;
}

/**
 * Robust Cloudinary Image Uploader with XHR Progress & Automatic Retries
 */
export async function uploadToCloudinary(file: File, options: UploadOptions): Promise<string> {
    const { folder, onProgress, maxRetries = 3 } = options;

    // 1. Process & Compress image client-side first
    const processedFile = await processImageForUpload(file);
    if (!processedFile) {
        throw new Error(`Gagal memproses file ${file.name}. Kemungkinan file rusak atau tidak didukung.`);
    }

    // 2. Fetch signature from Backend API
    const { data: signData } = await api.get(`/utils/cloudinary-signature?folder=${encodeURIComponent(folder)}`);

    const formData = new FormData();
    formData.append("file", processedFile);
    formData.append("api_key", signData.api_key);
    formData.append("timestamp", signData.timestamp.toString());
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);
    formData.append("transformation", signData.transformation);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`;

    // 3. Helper to perform XHR upload with progress tracking
    const performXhrUpload = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", uploadUrl);

            if (xhr.upload && onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete);
                    }
                };
            }

            xhr.onload = () => {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(response.secure_url);
                    } else {
                        const errorMsg = response.error?.message || "Upload gagal";
                        reject(new Error(errorMsg));
                    }
                } catch {
                    reject(new Error("Gagal membaca respons dari Cloudinary"));
                }
            };

            xhr.onerror = () => reject(new Error("Koneksi internet terputus saat upload"));
            xhr.ontimeout = () => reject(new Error("Upload timeout (koneksi lambat)"));

            xhr.timeout = 60000; // 60s timeout per attempt
            xhr.send(formData);
        });
    };

    // 4. Retry loop mechanism
    let lastError: Error = new Error("Upload gagal");
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await performXhrUpload();
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`Upload attempt ${attempt}/${maxRetries} failed:`, lastError.message);
            
            if (attempt < maxRetries) {
                // Wait 1.5s before retrying
                await new Promise((res) => setTimeout(res, 1500));
            }
        }
    }

    throw lastError;
}

/**
 * Upload multiple files sequentially with overall progress tracking
 */
export async function uploadMultipleToCloudinary(
    files: File[],
    folder: string,
    onTotalProgress?: (current: number, total: number, fileProgress: number) => void
): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadToCloudinary(file, {
            folder,
            onProgress: (percent) => {
                if (onTotalProgress) {
                    onTotalProgress(i + 1, files.length, percent);
                }
            }
        });
        urls.push(url);
    }
    return urls;
}
