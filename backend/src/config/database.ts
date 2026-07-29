import mongoose from 'mongoose';

import { env } from './env.js';
import { ensureChunkVectorSearchIndex } from './vectorSearch.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.info('MongoDB connected');
    await ensureChunkVectorSearchIndex();
  } catch (error) {
    console.error('MongoDB connection failed', error);
    throw error;
  }
};
