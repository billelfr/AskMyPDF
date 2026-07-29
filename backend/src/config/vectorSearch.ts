import { env } from './env.js';
import { ChunkModel } from '../models/chunk.model.js';

export const ensureChunkVectorSearchIndex = async (): Promise<void> => {
  if (!Number.isInteger(env.embeddingDimensions) || env.embeddingDimensions < 1) {
    throw new Error(`Invalid EMBEDDING_DIMENSIONS: ${env.embeddingDimensions}`);
  }

  const collection = ChunkModel.collection;
  const existingIndexes = await collection.listSearchIndexes(env.vectorSearchIndexName).toArray();

  if (existingIndexes.length > 0) {
    return;
  }

  await collection.createSearchIndex({
    name: env.vectorSearchIndexName,
    type: 'vectorSearch',
    definition: {
      fields: [
        {
          type: 'vector',
          path: 'embedding',
          numDimensions: env.embeddingDimensions,
          similarity: 'cosine',
        },
        {
          type: 'filter',
          path: 'documentId',
        },
      ],
    },
  });

  console.info(`MongoDB Atlas Vector Search index requested: ${env.vectorSearchIndexName}`);
};
