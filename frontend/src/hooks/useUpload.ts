'use client';

import { useState, useCallback } from 'react';
import { documentsService } from '../services/documents';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * Manages the full upload lifecycle: progress tracking, validation,
 * success/error states. Accepts an onSuccess callback so the parent
 * (e.g., the modal) can trigger React Query cache invalidation.
 */
export const useUpload = (onSuccess?: () => void) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (file.type !== 'application/pdf') return 'Only PDF files are supported.';
    if (file.size > 50 * 1024 * 1024) return 'File must be smaller than 50 MB.';
    return null;
  };

  const upload = useCallback(async (file: File) => {
    console.log("✅ useUpload.upload()", file.name);
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setError(null);

    try {
      await documentsService.upload(file, (pct) => setProgress(pct));
      setStatus('success');
      setProgress(100);
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
      setStatus('error');
    }
  }, [onSuccess]);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { upload, status, progress, error, reset };
};
