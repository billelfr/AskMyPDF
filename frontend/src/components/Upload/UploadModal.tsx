'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const { upload, status, progress, error, reset } = useUpload(onSuccess);

  const onDrop = useCallback(
  (acceptedFiles: File[]) => {
    console.log("📄 onDrop", acceptedFiles);

    if (acceptedFiles[0]) {
      console.log("🚀 Calling upload()");
      void upload(acceptedFiles[0]);
    }
  },
  [upload],
);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: status === 'uploading' || status === 'success',
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Upload PDF</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        {status !== 'success' && (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
              isDragActive
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50',
              (status === 'uploading') && 'pointer-events-none opacity-60',
            )}
          >
            <input {...getInputProps()} />

            {status === 'uploading' ? (
              <Loader2 size={32} className="mx-auto text-indigo-500 animate-spin mb-3" />
            ) : (
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
            )}

            {status === 'idle' && (
              <>
                <p className="text-sm font-medium text-slate-700">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">or click to browse — max 50 MB</p>
              </>
            )}

            {status === 'uploading' && (
              <p className="text-sm text-slate-600">Uploading…</p>
            )}
          </div>
        )}

        {/* Selected file preview */}
        {acceptedFiles[0] && status !== 'success' && (
          <div className="flex items-center gap-3 mt-3 px-3 py-2.5 bg-slate-50 rounded-lg">
            <FileText size={16} className="text-indigo-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {acceptedFiles[0].name}
              </p>
              <p className="text-xs text-slate-400">
                {(acceptedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {status === 'uploading' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
            <p className="text-base font-semibold text-slate-900">Upload complete!</p>
            <p className="text-sm text-slate-500 mt-1">
              Your PDF is being processed. It will appear in the sidebar shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && error && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-red-50 rounded-lg text-red-600">
            <AlertCircle size={14} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        {status !== 'success' && (
          <div className="flex gap-2 mt-5">
            <button
              onClick={handleClose}
              className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {acceptedFiles[0] && status === 'error' && (
              <button
                onClick={() => void upload(acceptedFiles[0])}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
