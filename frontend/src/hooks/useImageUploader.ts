import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  defaultUploadCoreManager,
  ImageUploadCoreManager,
  type UploadProgress,
} from '../lib/media/imageUploadCore';

export interface UseImageUploaderOptions {
  folder: string;
  autoToast?: boolean;
  maxRetries?: number;
  manager?: ImageUploadCoreManager;
}

export interface UseImageUploaderReturn {
  upload: (files: File | File[]) => Promise<string[] | null>;
  reset: () => void;
  isUploading: boolean;
  progress: UploadProgress;
  urls: string[];
  error: Error | null;
}

const initialProgress: UploadProgress = {
  stage: 'idle',
  percent: 0,
  currentFileIndex: 0,
  totalFiles: 0,
  currentFileName: '',
};

export function useImageUploader(options: UseImageUploaderOptions): UseImageUploaderReturn {
  const { folder, autoToast = true, maxRetries = 3, manager = defaultUploadCoreManager } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>(initialProgress);
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(initialProgress);
    setUrls([]);
    setError(null);
  }, []);

  const upload = useCallback(
    async (files: File | File[]): Promise<string[] | null> => {
      const fileList = Array.isArray(files) ? files : [files];
      if (fileList.length === 0) return [];

      setIsUploading(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      let toastId: string | number | undefined;
      if (autoToast) {
        toastId = toast.loading(`Mengunggah gambar... 0%`);
      }

      try {
        const uploadedUrls = await manager.uploadMultiple(fileList, {
          folder,
          maxRetries,
          signal: abortControllerRef.current.signal,
          onProgress: (prog) => {
            setProgress(prog);
            if (autoToast && toastId) {
              if (prog.stage === 'uploading') {
                const text = prog.totalFiles > 1
                  ? `Mengunggah gambar ${prog.currentFileIndex}/${prog.totalFiles}... ${prog.percent}%`
                  : `Mengunggah gambar... ${prog.percent}%`;
                toast.loading(text, { id: toastId });
              }
            }
          },
        });

        setUrls(uploadedUrls);
        setIsUploading(false);

        if (autoToast && toastId) {
          toast.success(`Berhasil mengunggah ${uploadedUrls.length} gambar!`, { id: toastId, duration: 3000 });
        }

        return uploadedUrls;
      } catch (err) {
        const uploadErr = err instanceof Error ? err : new Error(String(err));
        setError(uploadErr);
        setIsUploading(false);

        if (autoToast && toastId) {
          toast.error(uploadErr.message || 'Gagal mengunggah gambar.', { id: toastId, duration: 5000 });
        }

        return null;
      }
    },
    [folder, autoToast, maxRetries, manager]
  );

  return {
    upload,
    reset,
    isUploading,
    progress,
    urls,
    error,
  };
}
