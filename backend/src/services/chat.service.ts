import { getDocumentById } from './document.service.js';
import { generateAnswer } from './llm.service.js';
import { buildRagPrompt } from './prompt.service.js';
import { retrieveRelevantChunks } from './retrieval.service.js';
import { AppError } from '../utils/appError.js';

export interface ChatSource {
  page: number;
  chunkIndex: number;
  score: number;
}

export interface ChatResult {
  answer: string;
  sources: ChatSource[];
}

/**
 * Orchestrates the full RAG pipeline.
 *
 * Steps (in order):
 *   1. Validate that the document exists            → 404 if not found
 *   2. Call RetrievalService to get relevant chunks → vector search
 *   3. Build a grounded prompt via PromptService
 *   4. Call LLMService to generate the answer
 *   5. Return { answer, sources }
 *
 * This service has NO knowledge of Express / HTTP.
 */
export const askDocument = async (documentId: string, question: string): Promise<ChatResult> => {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new AppError('Question is required', 400);
  }

  const pipelineStartedAt = performance.now();

  // ── Step 1: Validate document exists ──────────────────────────────────────
  // getDocumentById throws AppError(404) if the document doesn't exist.
  await getDocumentById(documentId);

  console.info(`Chat pipeline started documentId=${documentId} question="${normalizedQuestion}"`);

  // ── Step 2: Retrieve relevant chunks ──────────────────────────────────────
  const retrievalStartedAt = performance.now();
  const chunks = await retrieveRelevantChunks(documentId, normalizedQuestion);
  const retrievalTimeMs = Math.round(performance.now() - retrievalStartedAt);

  console.info(
    `Retrieval step done documentId=${documentId} retrievedChunks=${chunks.length} retrievalTimeMs=${retrievalTimeMs}`,
  );

  // ── Step 3: Build grounded prompt ─────────────────────────────────────────
  const prompt = buildRagPrompt(normalizedQuestion, chunks);

  // ── Step 4: Call LLM ──────────────────────────────────────────────────────
  const answer = await generateAnswer(prompt);

  // ── Step 5: Log, compose and return ──────────────────────────────────────
  const totalTimeMs = Math.round(performance.now() - pipelineStartedAt);

  console.info(
    `Chat pipeline completed documentId=${documentId} question="${normalizedQuestion}" retrievedChunks=${chunks.length} totalTimeMs=${totalTimeMs}`,
  );

  const sources: ChatSource[] = chunks.map(({ page, chunkIndex, score }) => ({
    page,
    chunkIndex,
    score,
  }));

  return { answer, sources };
};
