'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (question: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  error?: string | null;
}

export function ChatInput({ onSend, isLoading, disabled, error }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter inserts a newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleChange = (v: string) => {
    setValue(v);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-4">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 rounded-lg text-red-600 text-sm">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      <div
        className={cn(
          'flex items-end gap-3 px-4 py-3 rounded-2xl border transition-colors',
          disabled ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100',
        )}
      >
        <textarea
          ref={textareaRef}
          id="chat-input"
          rows={1}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Select a document to start chatting…' : 'Ask something… (Enter to send, Shift+Enter for new line)'}
          disabled={disabled || isLoading}
          className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed max-h-[200px] leading-relaxed"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          id="send-button"
          aria-label="Send message"
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
            canSend
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed',
          )}
        >
          <Send size={15} />
        </button>
      </div>

      <p className="text-slate-400 text-xs text-center mt-2">
        Answers are grounded in the selected document only.
      </p>
    </div>
  );
}
