import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { AppError } from '../utils/appError.js';

export const notFoundHandler = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  if (error instanceof multer.MulterError) {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'PDF file size must not exceed 50 MB'
        : `Upload error: ${error.message}`;
  }

  response.status(statusCode).json({
    status: 'error',
    message,
  });
};
