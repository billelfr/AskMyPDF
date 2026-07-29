'use client';

import { useState } from 'react';
import { Plus, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { useDocuments, useDeleteDocument, DOCUMENTS_KEY } from '@/hooks/useDocuments';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentItem } from './DocumentItem';
import { UploadModal } from '../Upload/UploadModal';

interface SidebarProps {
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onDocumentDeleted: (id: string) => void;
}

export function Sidebar({ activeDocumentId, onSelectDocument, onDocumentDeleted }: SidebarProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: documents, isLoading, isError } = useDocuments();
  const { mutate: deleteDoc, variables: deletingId } = useDeleteDocument();
  const queryClient = useQueryClient();

  const handleDelete = (id: string) => {
    deleteDoc(id, {
      onSuccess: () => {
        if (activeDocumentId === id) onDocumentDeleted(id);
      },
    });
  };

  return (
    <>
      {/* Sidebar shell */}
      <aside className="flex flex-col w-72 shrink-0 bg-slate-950 border-r border-slate-800 h-screen">
        {/* Header */}
        <div className="px-4 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">AskMyPDF</span>
          </div>

          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Upload PDF
          </button>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-2 py-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 px-3 py-3 text-red-400 text-sm">
              <AlertCircle size={14} />
              Failed to load documents
            </div>
          )}

          {!isLoading && !isError && documents?.length === 0 && (
            <div className="px-3 py-6 text-center">
              <p className="text-slate-500 text-xs leading-relaxed">
                No documents yet.
                <br />
                Upload a PDF to get started.
              </p>
            </div>
          )}

          {documents?.map((doc) => (
            <DocumentItem
              key={doc._id}
              doc={doc}
              isActive={doc._id === activeDocumentId}
              onSelect={onSelectDocument}
              onDelete={handleDelete}
              isDeleting={deletingId === doc._id}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800">
          <p className="text-slate-600 text-xs">
            {documents?.filter((d) => d.status === 'READY').length ?? 0} document
            {documents?.filter((d) => d.status === 'READY').length !== 1 ? 's' : ''} ready
          </p>
        </div>
      </aside>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
          setUploadOpen(false);
        }}
      />
    </>
  );
}
