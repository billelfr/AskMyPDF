import { Router } from 'express';

import { chatWithDocument } from '../controllers/chat.controller.js';
import {
  deleteDocument,
  getDocument,
  listDocuments,
  uploadDocument,
} from '../controllers/document.controller.js';
import { searchDocument } from '../controllers/retrieval.controller.js';
import { uploadPdf } from '../middleware/upload.middleware.js';
import {
  validateDocumentId,
  validateDocumentIdParam,
} from '../middleware/validateObjectId.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/api/upload', uploadPdf.single('file'), asyncHandler(uploadDocument));
router.get('/api/documents', asyncHandler(listDocuments));
router.post(
  '/api/documents/:documentId/search',
  validateDocumentIdParam,
  asyncHandler(searchDocument),
);
router.post(
  '/api/documents/:documentId/chat',
  validateDocumentIdParam,
  asyncHandler(chatWithDocument),
);
router.get('/api/documents/:id', validateDocumentId, asyncHandler(getDocument));
router.delete('/api/documents/:id', validateDocumentId, asyncHandler(deleteDocument));

export default router;
