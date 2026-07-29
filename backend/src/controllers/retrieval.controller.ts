import type { Request, Response } from 'express';

import { retrieveRelevantChunks } from '../services/retrieval.service.js';
import { AppError } from '../utils/appError.js';

interface SearchRequestBody {
  question?: unknown;
}

export const searchDocument = async (request: Request, response: Response): Promise<void> => {
  const { question } = request.body as SearchRequestBody;

  if (typeof question !== 'string' || !question.trim()) {
    throw new AppError('Question is required', 400);
  }

  const matches = await retrieveRelevantChunks(request.params.documentId as string, question);

  response.status(200).json({ matches });
};
