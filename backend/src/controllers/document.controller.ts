import type { Request, Response } from 'express';
import { Types } from 'mongoose';

import { DocumentStatus } from '../models/document.model.js';
import { splitPdfContentIntoChunks } from '../services/chunk.service.js';
import {
  createDocumentFromUpload,
  deleteDocumentById,
  getDocumentById,
  getDocuments,
  saveDocumentChunks,
  updateDocumentStatus,
} from '../services/document.service.js';
import { generateDocumentEmbeddings } from '../services/embedding.service.js';
import { extractPdfContent } from '../services/pdf.service.js';
import { FileService } from '../services/file.service.js';
import { AppError } from '../utils/appError.js';

export const uploadDocument = async (request: Request, response: Response): Promise<void> => {
  if (!request.file) {
    throw new AppError('PDF file is required', 400);
  }

  const document = await createDocumentFromUpload(request.file);
  const filePath = request.file.path;

  console.info(`Uploading PDF...`);

  try {
    console.info(`Extracting text...`);
    const pdfContent = await extractPdfContent(filePath);
    const chunks = splitPdfContentIntoChunks(new Types.ObjectId(document.documentId), pdfContent);
    
    console.info(`Generating embeddings...`);
    const embeddings = await generateDocumentEmbeddings(
      chunks.map((chunk) => chunk.text),
      { documentId: document.documentId },
    );
    const chunksWithEmbeddings = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));

    console.info(`Saving chunks...`);
    await saveDocumentChunks(chunksWithEmbeddings);
    
    await updateDocumentStatus(document.documentId, DocumentStatus.Ready);
    document.status = DocumentStatus.Ready;
    console.info(`UPLOAD Document READY documentId=${document.documentId}`);
  } catch (error) {
    await updateDocumentStatus(document.documentId, DocumentStatus.Failed);
    throw error;
  } finally {
    console.info(`Deleting temporary file...`);
    await FileService.deleteTemporaryFile(filePath);
    console.info(`Temporary file deleted.`);
  }

  response.status(201).json(document);
};

export const listDocuments = async (_request: Request, response: Response): Promise<void> => {
  const documents = await getDocuments();

  response.status(200).json({ documents });
};

export const getDocument = async (request: Request, response: Response): Promise<void> => {
  const document = await getDocumentById(request.params.id as string);

  response.status(200).json({ document });
};

export const deleteDocument = async (request: Request, response: Response): Promise<void> => {
  await deleteDocumentById(request.params.id as string);

  response.status(204).send();
};
