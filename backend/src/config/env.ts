import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'GEMINI_API_KEY', 'GROQ_API_KEY'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI as string,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  geminiApiKey: process.env.GEMINI_API_KEY as string,
  groqApiKey: process.env.GROQ_API_KEY as string,
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant',
  groqTimeoutMs: Number(process.env.GROQ_TIMEOUT_MS ?? 30000),
  embeddingModel: process.env.EMBEDDING_MODEL ?? 'gemini-embedding-2',
  embeddingBatchSize: Number(process.env.EMBEDDING_BATCH_SIZE ?? 20),
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 3072),
  vectorSearchIndexName: process.env.VECTOR_SEARCH_INDEX_NAME ?? 'chunk_embedding_vector_index',
  topK: Number(process.env.TOP_K ?? 5),
  minSimilarityScore: Number(process.env.MIN_SIMILARITY_SCORE ?? 0.7),
};

if (!Number.isInteger(env.groqTimeoutMs) || env.groqTimeoutMs < 1) {
  throw new Error(`Invalid GROQ_TIMEOUT_MS: ${env.groqTimeoutMs}`);
}
