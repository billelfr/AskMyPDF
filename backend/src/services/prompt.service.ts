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

  return `You are a precise document assistant. Your only knowledge source is the CONTEXT below, which consists of excerpts extracted from a PDF document. Use ONLY the information provided in the CONTEXT to answer the question.

Rules you MUST follow:
- Base your answer exclusively on the CONTEXT. Do not add external knowledge.
- If the CONTEXT does not contain enough information to answer, respond with: "I could not find a clear answer to this question in the document."
- Cite the page number(s) when referencing specific information, e.g. "(page 4)".
- Keep the answer focused, accurate, and concise.
- Do not speculate or make assumptions beyond what is written.

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
 *   [1] (page 3, chunk 0)
 *   The company was founded in 1998...
 *
 *   [2] (page 5, chunk 2)
 *   Revenue grew by 42% in the third quarter...
 */
const formatChunks = (chunks: RetrievalMatch[]): string => {
  if (chunks.length === 0) {
    return '(No relevant excerpts found.)';
  }

  return chunks
    .map((chunk, index) => `[${index + 1}] (page ${chunk.page}, chunk ${chunk.chunkIndex})\n${chunk.text}`)
    .join('\n\n');
};
