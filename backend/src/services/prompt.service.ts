import type { RetrievalMatch } from './retrieval.service.js';

/**
 * Builds a grounded RAG prompt from the user's question and the retrieved chunks.
 *
 * This service has NO knowledge of:
 *   - MongoDB / Express / users
 *   - Gemini / any AI client
 *
 * It is a pure string-assembly function: (question, chunks) → prompt string.
 */
export const buildRagPrompt = (question: string, chunks: RetrievalMatch[]): string => {
  const context = formatChunks(chunks);

  return `You are an AI assistant that answers questions using the provided document context.

Never mention:
- chunk
- chunk id
- vector
- embedding
- retrieval score
- internal metadata

Only use the document text.

If citing sources, mention only page numbers.

Good:
Source: Page 7

Bad:
Source: Page 7, Chunk 6

---

CONTEXT:
${context}

---

QUESTION:
${question}

ANSWER:`;
};

/**
 * Formats retrieved chunks into a numbered, page-tagged context block.
 *
 * Example output:
 *   [1] (page 3)
 *   The company was founded in 1998...
 *
 *   [2] (page 5)
 *   Revenue grew by 42% in the third quarter...
 */
const formatChunks = (chunks: RetrievalMatch[]): string => {
  if (chunks.length === 0) {
    return '(No relevant excerpts found.)';
  }

  return chunks
    .map((chunk, index) => `[${index + 1}] (page ${chunk.page})\n${chunk.text}`)
    .join('\n\n');
};
