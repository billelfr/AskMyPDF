import { Schema, model } from 'mongoose';

export enum DocumentStatus {
  Processing = 'PROCESSING',
  Ready = 'READY',
  Failed = 'FAILED',
}

export interface Document {
  filename: string;
  originalName: string;
  size: number;
  uploadedAt: Date;
  status: DocumentStatus;
}

const documentSchema = new Schema<Document>(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.Processing,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

export const DocumentModel = model<Document>('Document', documentSchema);
