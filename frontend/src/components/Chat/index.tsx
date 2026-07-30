'use client';

import { FileText, Trash2, Menu } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import type { ApiDocument } from '@/types';
import { truncateFilename } from '@/lib/utils';

interface ChatPanelProps {
  document: ApiDocument | null;
  onToggleSidebar: () => void;
}

export function ChatPanel({ document, onToggleSidebar }: ChatPanelProps) {
  const { messages, isLoading, error, sendMessage, clearHistory } = useChat(
    document?._id ?? null,
  );

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 h-screen min-w-0 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 lg:px-6 py-4 border-b border-slate-100 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-1 items-center justify-between min-w-0">
          {document ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {truncateFilename(document.originalName, 50)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {document.status === 'READY' ? 'Ready to chat' : document.status}
                  </p>
                </div>
              </div>

              {hasMessages && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  title="Clear chat history"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-900">AskMyPDF</p>
          )}
        </div>
      </div>

      {/* Messages or empty state */}
      {!document ? (
        <EmptyState type="no-document" />
      ) : !hasMessages && !isLoading ? (
        <EmptyState type="no-messages" documentName={document.originalName} onSuggestionClick={sendMessage} />
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={!document || document.status !== 'READY'}
        error={error}
      />
    </div>
  );
}
