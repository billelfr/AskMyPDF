'use client';

import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { Sidebar } from '@/components/Sidebar';
import { ChatPanel } from '@/components/Chat';
import type { ApiDocument } from '@/types';

/**
 * Root page — the entire application lives on a single page.
 *
 * State:
 *   activeDocumentId — lifted here so Sidebar and ChatPanel share it.
 *
 * When a document is deleted and it was the active one, activeDocumentId
 * resets to null, which clears the chat panel.
 */
export default function Home() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const { data: documents } = useDocuments();

  const activeDocument: ApiDocument | null =
    documents?.find((d) => d._id === activeDocumentId) ?? null;

  const handleDocumentDeleted = (id: string) => {
    if (activeDocumentId === id) setActiveDocumentId(null);
  };

  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar
        activeDocumentId={activeDocumentId}
        onSelectDocument={setActiveDocumentId}
        onDocumentDeleted={handleDocumentDeleted}
      />
      <ChatPanel document={activeDocument} />
    </main>
  );
}
