import type { Types } from 'mongoose';

import type { Chunk } from '../models/chunk.model.js';
import type { ExtractedPdfContent } from './pdf.service.js';

const MAX_CHUNK_LENGTH = 1500;
const MIN_CHUNK_LENGTH = 1000;
const OVERLAP_LENGTH = 100;

export type ChunkWithoutEmbedding = Omit<Chunk, 'documentId' | 'embedding'> & {
  documentId: Types.ObjectId;
};

export const splitPdfContentIntoChunks = (
  documentId: Types.ObjectId,
  content: ExtractedPdfContent,
): ChunkWithoutEmbedding[] => {
  const chunks: ChunkWithoutEmbedding[] = [];

  for (const page of content.pages) {
    const pageChunks = splitTextIntoChunks(page.text);

    for (const text of pageChunks) {
      chunks.push({
        documentId,
        page: page.page,
        chunkIndex: chunks.length,
        text,
      });
    }
  }

  return chunks;
};

const splitTextIntoChunks = (text: string): string[] => {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  const paragraphs = normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (!currentChunk) {
      currentChunk = paragraph;
      continue;
    }

    const candidate = `${currentChunk}\n\n${paragraph}`;

    if (candidate.length <= MAX_CHUNK_LENGTH) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk.length >= MIN_CHUNK_LENGTH) {
      chunks.push(currentChunk);
      currentChunk = withOverlap(currentChunk, paragraph);
      continue;
    }

    chunks.push(...splitLongText(candidate));
    currentChunk = '';
  }

  if (currentChunk.trim()) {
    if (currentChunk.length > MAX_CHUNK_LENGTH) {
      chunks.push(...splitLongText(currentChunk));
    } else {
      chunks.push(currentChunk);
    }
  }

  return chunks.map((chunk) => chunk.trim()).filter(Boolean);
};

const splitLongText = (text: string): string[] => {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = findChunkEnd(text, start);
    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(end - OVERLAP_LENGTH, start + 1);
  }

  return chunks;
};

const findChunkEnd = (text: string, start: number): number => {
  const maxEnd = Math.min(start + MAX_CHUNK_LENGTH, text.length);

  if (maxEnd === text.length) {
    return maxEnd;
  }

  const preferredEnd = Math.max(start + MIN_CHUNK_LENGTH, maxEnd - 300);
  const sentenceEnd = Math.max(
    text.lastIndexOf('. ', maxEnd),
    text.lastIndexOf('! ', maxEnd),
    text.lastIndexOf('? ', maxEnd),
  );

  if (sentenceEnd >= preferredEnd) {
    return sentenceEnd + 1;
  }

  const whitespaceEnd = text.lastIndexOf(' ', maxEnd);

  if (whitespaceEnd >= preferredEnd) {
    return whitespaceEnd;
  }

  return maxEnd;
};

const withOverlap = (previousChunk: string, nextParagraph: string): string => {
  const overlap = previousChunk.slice(-OVERLAP_LENGTH).trim();

  return overlap ? `${overlap}\n\n${nextParagraph}` : nextParagraph;
};
