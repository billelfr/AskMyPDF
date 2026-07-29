'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * Client component that provides the React Query context.
 * Lives here (not in layout.tsx) because Next.js server components
 * cannot hold QueryClient state — only client components can.
 * A new QueryClient is created per-browser-session (useState ensures
 * it isn't recreated on every render).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
