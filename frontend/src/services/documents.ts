import { api } from './api';
import type { ApiDocument } from '../types';

export const documentsService = {
  list: async (): Promise<ApiDocument[]> => {
    const { data } = await api.get<{ documents: ApiDocument[] }>('/documents');
    return data.documents;
  },

  get: async (id: string): Promise<ApiDocument> => {
    const { data } = await api.get<{ document: ApiDocument }>(`/documents/${id}`);
    return data.document;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  /**
   * Upload a PDF with progress reporting.
   * Uses multipart/form-data — Axios sets the correct Content-Type boundary automatically.
   */
  upload: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<ApiDocument> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<ApiDocument>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });

    return data;
  },
};
