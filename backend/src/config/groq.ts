import Groq from 'groq-sdk';

import { env } from './env.js';

export const groqClient = new Groq({
  apiKey: env.groqApiKey,
  timeout: env.groqTimeoutMs,
});
