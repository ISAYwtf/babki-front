import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (_, error) => error.status !== 404,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 3,
    },
  },
});
