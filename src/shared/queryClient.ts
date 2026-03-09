import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (_, error) => error.status !== 404,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 3,
    },
  },
});

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError;
  }
}
