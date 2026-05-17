import type { FindAccountByQuery } from '@/entities/accounts';
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { savingsApi } from './savings.api';

const savingsQueryKeys = {
  all: ['savings'] as const,
  find: (query?: FindAccountByQuery) => [...savingsQueryKeys.all, query] as const,
};

export const savingsQueryOptions = {
  find: (query?: FindAccountByQuery) => queryOptions({
    queryKey: savingsQueryKeys.find(query),
    queryFn: () => savingsApi.find(query),
  }),
};

export const useCreateSavingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: savingsApi.create,
      onSuccess: (saving) => {
        queryClient.setQueryData(savingsQueryKeys.all, saving);
      },
    }),
  );
};
