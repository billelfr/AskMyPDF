import { ChunkModel, type Chunk } from '../models/chunk.model.js';
import { DocumentModel, DocumentStatus } from '../models/document.model.js';
import { AppError } from '../utils/appError.js';

export const createDocumentFromUpload = async (
  file: Express.Multer.File,
): Promise<{
  documentId: string;
  filename: string;
  status: DocumentStatus;
}> => {
  const document = await DocumentModel.create({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    status: DocumentStatus.Processing,
  });

  return {
    documentId: document._id.toString(),
    filename: document.filename,
    status: document.status,
  };
};

export const getDocuments = async () => {
  return DocumentModel.find().sort({ uploadedAt: -1 }).lean().exec();
};

export const getDocumentById = async (documentId: string) => {
  const document = await DocumentModel.findById(documentId).lean().exec();

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  return document;
};

export const saveDocumentChunks = async (chunks: Chunk[]): Promise<void> => {
  if (chunks.length === 0) {
    return;
  }

  await ChunkModel.insertMany(chunks, { ordered: true });
};

export const updateDocumentStatus = async (
  documentId: string,
  status: DocumentStatus,
): Promise<void> => {
  const document = await DocumentModel.findByIdAndUpdate(documentId, { status }).lean().exec();

  if (!document) {
    throw new AppError('Document not found', 404);
  }
};

export const deleteDocumentById = async (documentId: string): Promise<void> => {
  const document = await DocumentModel.findByIdAndDelete(documentId).lean().exec();

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  await ChunkModel.deleteMany({ documentId }).exec();
};
