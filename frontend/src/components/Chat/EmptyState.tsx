'use client';

import { BookOpen, ArrowUp } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-document' | 'no-messages';
  documentName?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
  'What are the main topics covered?',
  'Summarize the key findings.',
  'What conclusions does the document reach?',
  'Explain the methodology used.',
];

export function EmptyState({ type, documentName, onSuggestionClick }: EmptyStateProps) {
  if (type === 'no-document') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen size={28} className="text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Select a document</h2>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
          Choose a PDF from the sidebar to start asking questions about its content.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen size={24} className="text-indigo-400" />
      </div>
      <h2 className="text-base font-semibold text-slate-800 mb-1">
        {documentName ?? 'Document'} is ready
      </h2>
      <p className="text-slate-500 text-sm mb-6">Ask anything about this document.</p>

      <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
        {suggestions.map((s) => (
          <div
            key={s}
            onClick={() => onSuggestionClick?.(s)}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-indigo-300 hover:text-indigo-700 cursor-pointer transition-colors"
          >
            <span>{s}</span>
            <ArrowUp size={13} className="text-slate-400 shrink-0 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
