import path from 'node:path';

export const uploadConfig = {
  directory: path.resolve(process.cwd(), 'uploads'),
  maxFileSizeBytes: 50 * 1024 * 1024,
  allowedMimeTypes: ['application/pdf'],
  allowedExtensions: ['.pdf'],
};
