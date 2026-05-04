import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5, // 5s stale time
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchInterval: 1000 * 20, // Global poll every 20s
    },
    mutations: {
      retry: 0,
    },
  },
});
