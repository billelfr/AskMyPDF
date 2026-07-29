import axios from 'axios';

/**
 * Configured Axios instance.
 *
 * baseURL is '/api' — Next.js rewrites forward this to http://localhost:5000/api.
 * This means no backend URL is ever exposed in the client bundle.
 */
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60_000, // 60s — LLM generation can be slow
});
