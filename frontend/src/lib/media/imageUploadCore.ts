import api from '../api';

// ==========================================
// Ports & Types
// ==========================================

export interface CloudinarySignature {
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  transformation?: string;
  cloudName: string;
}

export interface SignatureProvider {
  fetchSignature(folder: string): Promise<CloudinarySignature>;
}

export interface TransporterPayload {
  file: File;
  signatureData: CloudinarySignature;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export interface Transporter {
  upload(payload: TransporterPayload): Promise<string>;
}

export interface ImageTransformer {
  transform(file: File): Promise<File>;
}

export interface UploadProgress {
  stage: 'idle' | 'converting' | 'compressing' | 'signing' | 'uploading' | 'completed';
  percent: number;
  currentFileIndex: number;
  totalFiles: number;
  currentFileName: string;
}

export interface CoreUploadOptions {
  folder: string;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
  maxRetries?: number;
}

// ==========================================
// Default Adapters (Production Implementations)
// ==========================================

export class AxiosSignatureProvider implements SignatureProvider {
  async fetchSignature(folder: string): Promise<CloudinarySignature> {
    const { data } = await api.get(`/utils/cloudinary-signature?folder=${encodeURIComponent(folder)}`);
    return {
      apiKey: data.api_key,
      timestamp: data.timestamp,
      signature: data.signature,
      folder: data.folder,
      transformation: data.transformation,
      cloudName: data.cloud_name,
    };
  }
}

export class XhrCloudinaryTransporter implements Transporter {
  async upload({ file, signatureData, onProgress, signal }: TransporterPayload): Promise<string> {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);
    if (signatureData.transformation) {
      formData.append('transformation', signatureData.transformation);
    }

    try {
      return await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);

        if (signal) {
          signal.addEventListener('abort', () => {
            xhr.abort();
            reject(new Error('Upload dibatalkan oleh pengguna.'));
          });
        }

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              onProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
        }

        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(res.secure_url);
            } else {
              reject(new Error(res.error?.message || 'Gagal mengunggah ke Cloudinary'));
            }
          } catch {
            reject(new Error('Gagal membaca respons dari Cloudinary'));
          }
        };

        xhr.onerror = () => reject(new Error('XHR_NETWORK_ERROR'));
        xhr.ontimeout = () => reject(new Error('XHR_NETWORK_ERROR'));
        xhr.timeout = 180000; // 3 minutes timeout for slower mobile upload connections
        xhr.send(formData);
      });
    } catch (err: any) {
      if (err?.message === 'XHR_NETWORK_ERROR') {
        // Fallback using fetch API with keepalive for mobile browsers
        try {
          const res = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            keepalive: true,
            signal,
          });
          const data = await res.json();
          if (res.ok && data.secure_url) {
            onProgress?.(100);
            return data.secure_url;
          }
          throw new Error(data.error?.message || 'Gagal mengunggah ke Cloudinary');
        } catch (fetchErr: any) {
          throw new Error('Koneksi terputus saat mengunggah dari smartphone. Mengulangi proses...');
        }
      }
      throw err;
    }
  }
}

export class CanvasHeicTransformer implements ImageTransformer {
  private readonly MAX_SIZE_MB = 10;

  async transform(file: File): Promise<File> {
    let processedFile = file;

    // 1. HEIC conversion
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.heic$|\.heif$/i.test(file.name);
    if (isHeic) {
      try {
        const heic2any = (await import('heic2any')).default;
        const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        const blob = Array.isArray(result) ? result[0] : result;
        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
        processedFile = new File([blob], `${nameWithoutExt}.jpeg`, { type: 'image/jpeg', lastModified: Date.now() });
      } catch (err) {
        console.error("HEIC conversion failed:", err);
        throw new Error(`Format HEIC pada file ${file.name} tidak dapat dikonversi.`);
      }
    }

    // 2. Canvas compress (Use safer max dimension for mobile browsers to prevent memory crashes)
    const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const initialMaxDim = isMobile ? 1080 : 1600;

    try {
      processedFile = await this.compressWithCanvas(processedFile, 0.75, initialMaxDim);
    } catch (err) {
      console.warn("Canvas compression failed, using original file:", err);
      if (file.size / 1024 / 1024 <= this.MAX_SIZE_MB) {
        return file;
      }
      throw err;
    }

    // 3. Multi-pass downscale if exceeding size
    let quality = 0.65;
    let maxDim = 1200;
    while (processedFile.size / 1024 / 1024 > this.MAX_SIZE_MB && quality >= 0.2) {
      try {
        processedFile = await this.compressWithCanvas(processedFile, quality, maxDim);
      } catch (err) {
        break;
      }
      quality -= 0.15;
      maxDim = Math.max(800, maxDim - 200);
    }

    return processedFile;
  }

  private compressWithCanvas(file: File, quality: number, maxDimension = 1600): Promise<File> {
    return new Promise(async (resolve, reject) => {
      let objectUrl: string | null = null;
      try {
        let width: number;
        let height: number;
        let drawSource: CanvasImageSource;

        // Use createImageBitmap if supported for zero-copy memory efficiency on Android
        if ('createImageBitmap' in window) {
          const bitmap = await createImageBitmap(file);
          width = bitmap.width;
          height = bitmap.height;
          drawSource = bitmap;
        } else {
          objectUrl = URL.createObjectURL(file);
          const img = new Image();
          img.src = objectUrl;
          await new Promise((res, rej) => {
            img.onload = res;
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

        // Close ImageBitmap to free memory immediately on Android
        if ('close' in drawSource && typeof (drawSource as any).close === 'function') {
          (drawSource as any).close();
        }

        canvas.toBlob(blob => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          if (!blob) return reject(new Error("Canvas to Blob failed"));
          const nameWithoutExt = file.name.split('.').slice(0, -1).join('.') || 'image';
          const finalFileName = file.name.endsWith('.jpeg') || file.name.endsWith('.jpg') ? file.name : `${nameWithoutExt}.jpeg`;
          resolve(new File([blob], finalFileName, { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', quality);
      } catch (err) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    });
  }
}

// ==========================================
// Deep Core Module Implementation
// ==========================================

export class ImageUploadCoreManager {
  constructor(
    private signatureProvider: SignatureProvider = new AxiosSignatureProvider(),
    private transporter: Transporter = new XhrCloudinaryTransporter(),
    private transformer: ImageTransformer = new CanvasHeicTransformer()
  ) {}

  async uploadSingle(file: File, options: CoreUploadOptions): Promise<string> {
    const { folder, onProgress, signal, maxRetries = 3 } = options;

    onProgress?.({
      stage: 'compressing',
      percent: 10,
      currentFileIndex: 1,
      totalFiles: 1,
      currentFileName: file.name,
    });

    const processedFile = await this.transformer.transform(file);

    onProgress?.({
      stage: 'uploading',
      percent: 40,
      currentFileIndex: 1,
      totalFiles: 1,
      currentFileName: processedFile.name,
    });

    let lastError: Error = new Error('Pengunggahan gagal');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const sigData = await this.signatureProvider.fetchSignature(folder);

        const url = await this.transporter.upload({
          file: processedFile,
          signatureData: sigData,
          signal,
          onProgress: (filePercent) => {
            onProgress?.({
              stage: 'uploading',
              percent: Math.min(99, 40 + Math.round(filePercent * 0.58)),
              currentFileIndex: 1,
              totalFiles: 1,
              currentFileName: processedFile.name,
            });
          },
        });

        onProgress?.({
          stage: 'completed',
          percent: 100,
          currentFileIndex: 1,
          totalFiles: 1,
          currentFileName: processedFile.name,
        });

        return url;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 1500));
        }
      }
    }

    throw lastError;
  }

  async uploadMultiple(files: File[], options: CoreUploadOptions): Promise<string[]> {
    const urls: string[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const url = await this.uploadSingle(file, {
        ...options,
        onProgress: (prog) => {
          options.onProgress?.({
            ...prog,
            currentFileIndex: i + 1,
            totalFiles: total,
            percent: Math.round(((i + prog.percent / 100) / total) * 100),
          });
        },
      });
      urls.push(url);
    }
    return urls;
  }
}

export const defaultUploadCoreManager = new ImageUploadCoreManager();
