'use client';

import { BookOpen } from 'lucide-react';
import type { ChatSource } from '@/types';

interface SourceCitationsProps {
  sources: ChatSource[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  // Deduplicate pages and sort ascending
  const pages = [...new Set(sources.map((s) => s.page))].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="flex items-center gap-1 text-xs text-slate-500 mr-1">
        <BookOpen size={11} />
        Sources:
      </span>
      {pages.map((page) => (
        <span
          key={page}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
        >
          Page {page}
        </span>
      ))}
    </div>
  );
}
