import type { Request, Response } from 'express';

import { askDocument } from '../services/chat.service.js';
import { AppError } from '../utils/appError.js';

interface ChatRequestBody {
  question?: unknown;
}

/**
 * POST /api/documents/:documentId/chat
 *
 * Thin HTTP adapter. No business logic lives here.
 * Reads the request body, delegates entirely to chat.service, writes the response.
 */
export const chatWithDocument = async (request: Request, response: Response): Promise<void> => {
  const { question } = request.body as ChatRequestBody;

  if (typeof question !== 'string' || !question.trim()) {
    throw new AppError('Question is required', 400);
  }

  const result = await askDocument(request.params.documentId as string, question);

  response.status(200).json(result);
};
