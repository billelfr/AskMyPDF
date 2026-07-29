'use client';

import { FileText, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn, formatFileSize, formatDate, truncateFilename } from '@/lib/utils';
import type { ApiDocument } from '@/types';

interface DocumentItemProps {
  doc: ApiDocument;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const statusConfig = {
  READY: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Ready' },
  PROCESSING: { icon: Loader2, color: 'text-amber-400', label: 'Processing' },
  FAILED: { icon: XCircle, color: 'text-red-400', label: 'Failed' },
};

export function DocumentItem({ doc, isActive, onSelect, onDelete, isDeleting }: DocumentItemProps) {
  const status = statusConfig[doc.status];
  const StatusIcon = status.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => doc.status === 'READY' && onSelect(doc._id)}
      onKeyDown={(e) => e.key === 'Enter' && doc.status === 'READY' && onSelect(doc._id)}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors',
        'text-slate-300 hover:bg-slate-800',
        isActive && 'bg-slate-800 text-white',
        doc.status !== 'READY' && 'opacity-70 cursor-default',
      )}
    >
      {/* File icon */}
      <div className={cn('mt-0.5 shrink-0', isActive ? 'text-indigo-400' : 'text-slate-500')}>
        <FileText size={16} />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {truncateFilename(doc.originalName)}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <StatusIcon
            size={11}
            className={cn(status.color, doc.status === 'PROCESSING' && 'animate-spin')}
          />
          <span className={cn('text-xs', status.color)}>{status.label}</span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-slate-500 text-xs">{formatFileSize(doc.size)}</span>
        </div>
        <p className="text-slate-600 text-xs mt-0.5">{formatDate(doc.uploadedAt)}</p>
      </div>

      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(doc._id);
        }}
        disabled={isDeleting}
        className={cn(
          'absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
          'text-slate-500 hover:text-red-400 hover:bg-slate-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        title="Delete document"
        aria-label="Delete document"
      >
        {isDeleting ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Trash2 size={13} />
        )}
      </button>
    </div>
  );
}
