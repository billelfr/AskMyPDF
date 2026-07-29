import type { Content } from '@google/genai';

import { env } from '../config/env.js';
import { geminiClient } from '../config/gemini.js';
import { AppError } from '../utils/appError.js';

interface GenerateEmbeddingsOptions {
  documentId: string;
}

export const generateDocumentEmbeddings = async (
  texts: string[],
  options: GenerateEmbeddingsOptions,
): Promise<number[][]> => {
  if (texts.length === 0) {
    return [];
  }

  const batchSize = getEmbeddingBatchSize();
  const embeddings: number[][] = [];
  const startedAt = performance.now();
  const totalBatches = Math.ceil(texts.length / batchSize);

  console.info(
    `UPLOAD Generating document embeddings documentId=${options.documentId} totalChunks=${texts.length} totalBatches=${totalBatches}`,
  );

  for (let batchStart = 0; batchStart < texts.length; batchStart += batchSize) {
    const batchNumber = Math.floor(batchStart / batchSize) + 1;
    const batchTexts = texts.slice(batchStart, batchStart + batchSize);
    const batchStartedAt = performance.now();

    console.info(
      `UPLOAD Generating document embedding batch documentId=${options.documentId} batch=${batchNumber}/${totalBatches} chunks=${batchTexts.length}`,
    );

    const batchEmbeddings = await generateEmbeddingBatch(batchTexts);

    embeddings.push(...batchEmbeddings);

    console.info(
      `UPLOAD Document embedding batch completed documentId=${options.documentId} batch=${batchNumber}/${totalBatches} processingTimeMs=${Math.round(
        performance.now() - batchStartedAt,
      )}`,
    );
  }

  console.info(
    `UPLOAD Document embeddings generated documentId=${options.documentId} totalChunks=${texts.length} processingTimeMs=${Math.round(
      performance.now() - startedAt,
    )}`,
  );

  return embeddings;
};

export const generateQueryEmbedding = async (
  question: string,
  options: GenerateEmbeddingsOptions,
): Promise<number[]> => {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new AppError('Question is required', 400);
  }

  const startedAt = performance.now();

  console.info(`CHAT Generating query embedding documentId=${options.documentId}`);

  const [queryEmbedding] = await generateEmbeddingBatch([normalizedQuestion]);

  if (!queryEmbedding) {
    throw new AppError('Question embedding generation failed', 502);
  }

  console.info(
    `CHAT Query embedding generated documentId=${options.documentId} embeddingTimeMs=${Math.round(
      performance.now() - startedAt,
    )}`,
  );

  return queryEmbedding;
};

const generateEmbeddingBatch = async (texts: string[]): Promise<number[][]> => {
  const response = await geminiClient.models.embedContent({
    model: env.embeddingModel,
    contents: texts.map(toContent),
  });

  const embeddings = response.embeddings?.map((embedding) => embedding.values ?? []) ?? [];

  if (
    embeddings.length !== texts.length ||
    embeddings.some((embedding) => embedding.length === 0)
  ) {
    throw new AppError('Embedding generation returned an invalid response', 502);
  }

  return embeddings;
};

const toContent = (text: string): Content => ({
  role: 'user',
  parts: [
    {
      text: `title: none | text: ${text}`,
    },
  ],
});

const getEmbeddingBatchSize = (): number => {
  if (!Number.isInteger(env.embeddingBatchSize) || env.embeddingBatchSize < 1) {
    throw new AppError('EMBEDDING_BATCH_SIZE must be a positive integer', 500);
  }

  return env.embeddingBatchSize;
};
