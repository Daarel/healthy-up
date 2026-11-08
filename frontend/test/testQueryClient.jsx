import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });
}

export function wrapWithQueryClient(ui) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}
