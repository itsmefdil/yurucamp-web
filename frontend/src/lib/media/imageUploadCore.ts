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

export class UploadAbortedError extends Error {
  constructor() {
    super('Upload dibatalkan.');
    this.name = 'UploadAbortedError';
  }
}

const MAX_UPLOAD_SIZE_MB = 10; // Cloudinary free tier limit per image
const UPLOAD_CONCURRENCY = 2;
const RETRY_BASE_DELAY_MS = 1500;

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new UploadAbortedError());
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new UploadAbortedError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });

const toJpegName = (name: string) => {
  const base = name.split('.').slice(0, -1).join('.') || name || 'image';
  return `${base}.jpeg`;
};

/**
 * Copies the file's bytes into memory. On Android, a File picked from the gallery or a
 * cloud provider is a lazy reference to a content:// URI whose read permission can be
 * revoked later, so reading it at submit time fails with NotReadableError.
 */
async function snapshotFile(file: File): Promise<File> {
  try {
    const buffer = await file.arrayBuffer();
    return new File([buffer], file.name, { type: file.type, lastModified: file.lastModified });
  } catch {
    throw new Error(`File "${file.name}" tidak dapat dibaca. Coba pilih ulang fotonya.`);
  }
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
  upload({ file, signatureData, onProgress, signal }: TransporterPayload): Promise<string> {
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

    return new Promise<string>((resolve, reject) => {
      if (signal?.aborted) return reject(new UploadAbortedError());

      const xhr = new XMLHttpRequest();
      const onAbort = () => xhr.abort();
      signal?.addEventListener('abort', onAbort, { once: true });
      const settle = (fn: () => void) => {
        signal?.removeEventListener('abort', onAbort);
        fn();
      };

      xhr.open('POST', uploadUrl);
      xhr.timeout = 180000; // 3 minutes for slow mobile connections

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
      }

      xhr.onload = () => settle(() => {
        let res: any;
        try {
          res = JSON.parse(xhr.responseText);
        } catch {
          return reject(new Error('Gagal membaca respons dari server gambar.'));
        }
        if (xhr.status >= 200 && xhr.status < 300 && res.secure_url) {
          resolve(res.secure_url);
        } else {
          reject(new Error(res.error?.message || 'Gagal mengunggah gambar.'));
        }
      });
      xhr.onerror = () => settle(() =>
        reject(new Error('Koneksi terputus saat mengunggah. Periksa koneksi internet lalu coba lagi.'))
      );
      xhr.ontimeout = () => settle(() =>
        reject(new Error('Upload terlalu lama. Periksa koneksi internet lalu coba lagi.'))
      );
      xhr.onabort = () => settle(() => reject(new UploadAbortedError()));

      xhr.send(formData);
    });
  }
}

export class CanvasHeicTransformer implements ImageTransformer {
  async transform(file: File): Promise<File> {
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const maxDim = isMobile ? 1080 : 1600;
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || /\.heic$|\.heif$/i.test(file.name);

    let result: File;
    try {
      // Native decode first: also covers HEIC on Safari, which avoids the heavy heic2any WASM.
      result = await this.compressWithCanvas(file, 0.75, maxDim);
    } catch (err) {
      if (!isHeic) {
        console.warn('Canvas compression failed, falling back to original file:', err);
        return this.originalIfSmallEnough(file);
      }
      const jpeg = await this.convertHeic(file);
      try {
        result = await this.compressWithCanvas(jpeg, 0.75, maxDim);
      } catch (compressErr) {
        console.warn('Canvas compression of converted HEIC failed:', compressErr);
        return this.originalIfSmallEnough(jpeg);
      }
    }

    // Multi-pass downscale if still exceeding the size limit
    let quality = 0.65;
    let dim = Math.min(maxDim, 1200);
    while (result.size / 1024 / 1024 > MAX_UPLOAD_SIZE_MB && quality >= 0.2) {
      try {
        result = await this.compressWithCanvas(result, quality, dim);
      } catch {
        break;
      }
      quality -= 0.15;
      dim = Math.max(800, dim - 200);
    }

    return result;
  }

  private async originalIfSmallEnough(file: File): Promise<File> {
    if (file.size / 1024 / 1024 <= MAX_UPLOAD_SIZE_MB) {
      return snapshotFile(file);
    }
    throw new Error(`Gambar "${file.name}" tidak dapat diproses. Coba gunakan foto lain atau format JPG/PNG.`);
  }

  private async convertHeic(file: File): Promise<File> {
    try {
      const heic2any = (await import('heic2any')).default;
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      return new File([blob], toJpegName(file.name), { type: 'image/jpeg', lastModified: Date.now() });
    } catch (err) {
      console.error('HEIC conversion failed:', err);
      throw new Error(`Format HEIC pada "${file.name}" tidak dapat dikonversi. Coba gunakan format JPG/PNG.`);
    }
  }

  /**
   * Decodes the image, downscaling during decode for large files so high-resolution
   * photos (50–200 MP) don't need a full-size bitmap in memory on mobile devices.
   */
  private async decode(file: File, maxDimension: number): Promise<{ source: CanvasImageSource; width: number; height: number; release: () => void }> {
    if (typeof createImageBitmap === 'function') {
      // Large files are almost certainly wider than maxDimension, so resizing on decode never upscales.
      if (file.size > 3 * 1024 * 1024) {
        try {
          const bitmap = await createImageBitmap(file, { resizeWidth: maxDimension, resizeQuality: 'high' });
          return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
        } catch {
          // Resize options unsupported or failed: fall through to a plain decode.
        }
      }
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Gagal membaca data gambar'));
      });
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(objectUrl) };
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      throw err;
    }
  }

  private async compressWithCanvas(file: File, quality: number, maxDimension: number): Promise<File> {
    const { source, width: srcWidth, height: srcHeight, release } = await this.decode(file, maxDimension);
    const canvas = document.createElement('canvas');
    try {
      const scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));
      canvas.width = Math.round(srcWidth * scale);
      canvas.height = Math.round(srcHeight * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      release();

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
      if (!blob) throw new Error('Canvas to Blob failed');
      const name = /\.jpe?g$/i.test(file.name) ? file.name : toJpegName(file.name);
      return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
    } finally {
      release();
      // Free the canvas backing store right away; iOS Safari has a low total canvas memory cap.
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}

// ==========================================
// Deep Core Module Implementation
// ==========================================

export class ImageUploadCoreManager {
  // Files already compressed by prepare(); upload skips the transform step for these.
  private preparedFiles = new WeakSet<File>();

  constructor(
    private signatureProvider: SignatureProvider = new AxiosSignatureProvider(),
    private transporter: Transporter = new XhrCloudinaryTransporter(),
    private transformer: ImageTransformer = new CanvasHeicTransformer()
  ) {}

  /**
   * Compresses a file right after the user picks it, so the bytes are read while the
   * browser still has access to them, and the form only keeps a small JPEG in memory.
   */
  async prepare(file: File): Promise<File> {
    if (this.preparedFiles.has(file)) return file;
    const processed = await this.transformer.transform(file);
    this.preparedFiles.add(processed);
    return processed;
  }

  async uploadSingle(file: File, options: CoreUploadOptions): Promise<string> {
    const { folder, onProgress, signal, maxRetries = 3 } = options;
    const report = (stage: UploadProgress['stage'], percent: number, name: string) =>
      onProgress?.({ stage, percent, currentFileIndex: 1, totalFiles: 1, currentFileName: name });

    if (signal?.aborted) throw new UploadAbortedError();

    report('compressing', 10, file.name);
    const processedFile = await this.prepare(file);
    report('uploading', 40, processedFile.name);

    let lastError: Error = new Error('Pengunggahan gagal');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const sigData = await this.signatureProvider.fetchSignature(folder);
        const url = await this.transporter.upload({
          file: processedFile,
          signatureData: sigData,
          signal,
          onProgress: (filePercent) =>
            report('uploading', Math.min(99, 40 + Math.round(filePercent * 0.58)), processedFile.name),
        });
        report('completed', 100, processedFile.name);
        return url;
      } catch (err) {
        if (err instanceof UploadAbortedError || signal?.aborted) throw new UploadAbortedError();
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), signal);
        }
      }
    }

    throw lastError;
  }

  /**
   * Uploads files with limited concurrency, returning URLs in the same order as `files`.
   * The first failure cancels the remaining uploads.
   */
  async uploadMultiple(files: File[], options: CoreUploadOptions): Promise<string[]> {
    const total = files.length;
    const urls: string[] = new Array(total);
    const percents: number[] = new Array(total).fill(0);
    let completed = 0;
    let nextIndex = 0;

    const controller = new AbortController();
    const onOuterAbort = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    options.signal?.addEventListener('abort', onOuterAbort, { once: true });

    const worker = async () => {
      while (nextIndex < total && !controller.signal.aborted) {
        const i = nextIndex++;
        urls[i] = await this.uploadSingle(files[i], {
          ...options,
          signal: controller.signal,
          onProgress: (prog) => {
            percents[i] = prog.percent;
            options.onProgress?.({
              ...prog,
              currentFileIndex: Math.min(total, completed + 1),
              totalFiles: total,
              percent: Math.round(percents.reduce((a, b) => a + b, 0) / total),
            });
          },
        });
        completed++;
      }
    };

    try {
      await Promise.all(
        Array.from({ length: Math.min(UPLOAD_CONCURRENCY, total) }, () =>
          worker().catch((err) => {
            controller.abort();
            throw err;
          })
        )
      );
      if (controller.signal.aborted) throw new UploadAbortedError();
      return urls;
    } finally {
      options.signal?.removeEventListener('abort', onOuterAbort);
    }
  }
}

export const defaultUploadCoreManager = new ImageUploadCoreManager();
