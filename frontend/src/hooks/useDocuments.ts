'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '../services/documents';

export const DOCUMENTS_KEY = ['documents'] as const;

/**
 * Fetches the document list and auto-polls every 3 seconds while any
 * document is still in PROCESSING state. Stops polling once all are settled.
 */
export const useDocuments = () => {
  return useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: documentsService.list,
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some((d) => d.status === 'PROCESSING');
      return hasProcessing ? 3000 : false;
    },
    staleTime: 10_000,
  });
};

/**
 * Deletes a document and immediately invalidates the document list cache
 * so the sidebar refreshes without a manual page reload.
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsService.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
};
