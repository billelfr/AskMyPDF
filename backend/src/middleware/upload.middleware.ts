import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import multer from 'multer';

import { uploadConfig } from '../config/upload.js';
import { AppError } from '../utils/appError.js';

fs.mkdirSync(uploadConfig.directory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadConfig.directory);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: uploadConfig.maxFileSizeBytes,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf =
      uploadConfig.allowedMimeTypes.includes(file.mimetype) &&
      uploadConfig.allowedExtensions.includes(extension);

    if (!isPdf) {
      callback(new AppError('Only PDF files are allowed', 400));
      return;
    }

    callback(null, true);
  },
});
