import { Types } from 'mongoose';

import { env } from '../config/env.js';
import { ChunkModel } from '../models/chunk.model.js';
import { DocumentModel } from '../models/document.model.js';
import { AppError } from '../utils/appError.js';
import { generateQueryEmbedding } from './embedding.service.js';

export interface RetrievalMatch {
  page: number;
  chunkIndex: number;
  text: string;
  score: number;
}

interface VectorSearchResult {
  page: number;
  chunkIndex: number;
  text: string;
  score: number;
}

export const retrieveRelevantChunks = async (
  documentId: string,
  question: string,
): Promise<RetrievalMatch[]> => {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new AppError('Question is required', 400);
  }

  const documentObjectId = new Types.ObjectId(documentId);
  const document = await DocumentModel.exists({ _id: documentObjectId });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  const embeddingStartedAt = performance.now();
  const questionEmbedding = await generateQueryEmbedding(normalizedQuestion, { documentId });
  const embeddingTimeMs = Math.round(performance.now() - embeddingStartedAt);

  const searchStartedAt = performance.now();

  try {
    console.info(
      `CHAT Searching vector index documentId=${documentId} index=${env.vectorSearchIndexName}`,
    );

    const matches = await ChunkModel.aggregate<VectorSearchResult>([
      {
        $vectorSearch: {
          index: env.vectorSearchIndexName,
          path: 'embedding',
          queryVector: questionEmbedding,
          numCandidates: getNumCandidates(),
          limit: env.topK,
          filter: {
            documentId: documentObjectId,
          },
        },
      },
      {
        $project: {
          _id: 0,
          page: 1,
          chunkIndex: 1,
          text: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $match: {
          score: { $gte: env.minSimilarityScore },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
    ]).exec();

    const searchTimeMs = Math.round(performance.now() - searchStartedAt);

    console.info(
      `CHAT Retrieved ${matches.length} chunks documentId=${documentId} question="${normalizedQuestion}" embeddingTimeMs=${embeddingTimeMs} searchTimeMs=${searchTimeMs}`,
    );

    return matches;
  } catch (error) {
    console.error(
      `Vector search failed documentId=${documentId} question="${normalizedQuestion}" embeddingTimeMs=${embeddingTimeMs}`,
      error,
    );
    throw new AppError('Vector search failed', 500);
  }
};

const getNumCandidates = (): number => {
  if (!Number.isInteger(env.topK) || env.topK < 1) {
    throw new AppError('TOP_K must be a positive integer', 500);
  }

  if (
    Number.isNaN(env.minSimilarityScore) ||
    env.minSimilarityScore < 0 ||
    env.minSimilarityScore > 1
  ) {
    throw new AppError('MIN_SIMILARITY_SCORE must be between 0 and 1', 500);
  }

  return Math.max(env.topK * 20, env.topK);
};
