import api from '../api';

export interface UploadReport {
  outcome: 'success' | 'failed';
  stage: 'prepare' | 'upload';
  folder: string;
  files: File[];
  durationMs?: number;
  error?: unknown;
}

const describeConnection = (): string => {
  if (typeof navigator === 'undefined') return 'unknown';
  if (!navigator.onLine) return 'offline';
  const connection = (navigator as any).connection;
  return connection?.effectiveType ?? 'unknown';
};

const describeType = (file: File) => file.type || file.name.split('.').pop()?.toLowerCase() || 'unknown';

/**
 * Reports an upload outcome to the backend so upload reliability can be monitored
 * from the admin System Health page. Fire-and-forget: never throws, never blocks the UI.
 */
export function reportUpload({ outcome, stage, folder, files, durationMs, error }: UploadReport): void {
  try {
    // Uploads only happen for logged-in users; skip otherwise to avoid triggering auth redirects.
    if (!localStorage.getItem('token')) return;

    const err = error instanceof Error ? error : error != null ? new Error(String(error)) : undefined;
    void api
      .post('/utils/upload-logs', {
        outcome,
        stage,
        folder,
        fileCount: files.length,
        totalBytes: files.reduce((sum, f) => sum + f.size, 0),
        fileTypes: Array.from(new Set(files.map(describeType))).join(','),
        durationMs: durationMs != null ? Math.round(durationMs) : undefined,
        errorName: err?.name,
        errorMessage: err?.message,
        connection: describeConnection(),
      })
      .catch(() => {
        // Telemetry must never affect the user flow.
      });
  } catch {
    // localStorage can throw in some private browsing modes.
  }
}
