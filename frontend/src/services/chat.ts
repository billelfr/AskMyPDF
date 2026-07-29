import { api } from './api';
import type { ChatResponse } from '../types';

export const chatService = {
  ask: async (documentId: string, question: string): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>(`/documents/${documentId}/chat`, { question });
    return data;
  },
};
