import { APIConnectionTimeoutError, APIError } from 'groq-sdk';
import type { Groq } from 'groq-sdk';

import { env } from '../config/env.js';
import { groqClient } from '../config/groq.js';
import { AppError } from '../utils/appError.js';

/**
 * Sends a fully-formed prompt to Groq and returns the raw text response.
 *
 * This service has NO knowledge of:
 *   - MongoDB / documents / chunks
 *   - Express / HTTP
 *   - Users
 *
 * It is a pure AI gateway: prompt in → text out.
 */
export const generateAnswer = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) {
    throw new AppError('Prompt must not be empty', 400);
  }

  const startedAt = performance.now();

  let text: string;

  try {
    const response: Groq.Chat.ChatCompletion = await groqClient.chat.completions.create(
      {
        model: env.groqModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        timeout: env.groqTimeoutMs,
      },
    );

    text = response.choices[0]?.message.content ?? '';
  } catch (error) {
    console.error('LLM generation failed', error);

    if (error instanceof APIConnectionTimeoutError) {
      throw new AppError('LLM generation timed out', 502);
    }

    if (error instanceof APIError) {
      throw new AppError('LLM generation failed', 502);
    }

    throw new AppError('LLM generation failed', 502);
  }

  const generationTimeMs = Math.round(performance.now() - startedAt);

  if (!text.trim()) {
    throw new AppError('LLM returned an empty response', 502);
  }

  console.info(
    `LLM generation completed model=${env.groqModel} generationTimeMs=${generationTimeMs}`,
  );

  return text.trim();
};
