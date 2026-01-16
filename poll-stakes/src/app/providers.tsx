'use client';

import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TmaProvider } from '@/components/tma/TmaProvider';
import { throwIfUndefined } from '@/lib/utils';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  // Manifest URL from env (e.g., a public gist or hosted JSON file)
  const manifestUrl = process.env.NEXT_PUBLIC_MANIFEST_URL;
  throwIfUndefined(manifestUrl, 'NEXT_PUBLIC_MANIFEST_URL');

  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <TmaProvider>{children}</TmaProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}
