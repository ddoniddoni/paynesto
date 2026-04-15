import { QueryClient } from '@tanstack/react-query';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
