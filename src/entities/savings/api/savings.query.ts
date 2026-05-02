import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { savingsApi } from './savings.api';

const savingsQueryKeys = {
  all: ['savings'] as const,
  detail: (asOfDate?: string) => [...savingsQueryKeys.all, asOfDate] as const,
};

export const savingsQueryOptions = {
  findByUserId: (asOfDate?: string) => queryOptions({
    queryKey: savingsQueryKeys.detail(asOfDate),
    queryFn: () => savingsApi.findByUserId(),
  }),
};

export const useUpsertSavingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: () => savingsApi.create(),
      onSuccess: (account) => {
        queryClient.setQueryData(savingsQueryKeys.detail(), account);
      },
    }),
  );
};
