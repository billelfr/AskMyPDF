import { Schema, model, type Types } from 'mongoose';

import { DocumentModel } from './document.model.js';

export interface Chunk {
  documentId: Types.ObjectId;
  page: number;
  chunkIndex: number;
  text: string;
  embedding: number[];
}

const chunkSchema = new Schema<Chunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: DocumentModel.modelName,
      required: true,
      index: true,
    },
    page: {
      type: Number,
      required: true,
      min: 1,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: number[]) => value.length > 0,
        message: 'Embedding must contain at least one number',
      },
    },
  },
  {
    versionKey: false,
  },
);

chunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

export const ChunkModel = model<Chunk>('Chunk', chunkSchema);
