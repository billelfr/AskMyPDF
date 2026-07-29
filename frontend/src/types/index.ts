// ── Document types (from backend) ──────────────────────────────────────────

export type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED';

export interface ApiDocument {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  status: DocumentStatus;
}

// ── Chat types ──────────────────────────────────────────────────────────────

export interface ChatSource {
  page: number;
  chunkIndex: number;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

// ── Frontend-only message type ──────────────────────────────────────────────
// Stored in localStorage per document. timestamp is ISO string for JSON safety.

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  timestamp: string;
}
