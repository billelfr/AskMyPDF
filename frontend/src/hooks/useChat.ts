'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chat';
import type { Message } from '../types';
import { generateId } from '../lib/utils';

const storageKey = (id: string) => `askmypdf_chat_${id}`;

/**
 * Manages chat history for a single document.
 *
 * Design decisions:
 * - Messages live in React state (not React Query) because they originate
 *   from the frontend and are immediately appended optimistically.
 * - localStorage provides persistence across page refreshes per documentId.
 * - Switching documents swaps the entire message array from localStorage.
 * - Errors do NOT remove the user's message so they can see what they asked.
 */
export const useChat = (documentId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load / clear history when the selected document changes
  useEffect(() => {
    if (!documentId) {
      setMessages([]);
      setError(null);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(documentId));
      setMessages(raw ? (JSON.parse(raw) as Message[]) : []);
    } catch {
      setMessages([]);
    }
    setError(null);
  }, [documentId]);

  // Persist whenever messages update
  useEffect(() => {
    if (!documentId) return;
    localStorage.setItem(storageKey(documentId), JSON.stringify(messages));
  }, [messages, documentId]);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!documentId || !question.trim() || isLoading) return;

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: question.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await chatService.ask(documentId, question.trim());

        const aiMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setError('Failed to get a response. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [documentId, isLoading],
  );

  const clearHistory = useCallback(() => {
    if (!documentId) return;
    localStorage.removeItem(storageKey(documentId));
    setMessages([]);
    setError(null);
  }, [documentId]);

  return { messages, isLoading, error, sendMessage, clearHistory };
};
