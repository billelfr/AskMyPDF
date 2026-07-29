import type { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

import { AppError } from '../utils/appError.js';

export const validateDocumentId = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const { id } = request.params;

  if (!id || !isValidObjectId(id)) {
    next(new AppError('Invalid document id', 400));
    return;
  }

  next();
};

export const validateDocumentIdParam = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const { documentId } = request.params;

  if (!documentId || !isValidObjectId(documentId)) {
    next(new AppError('Invalid document id', 400));
    return;
  }

  next();
};
