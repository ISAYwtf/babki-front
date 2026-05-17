import type { FindAccountByQuery } from '@/entities/accounts';
import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { balancesApi } from './balances.api';

const balancesQueryKeys = {
  all: ['balances'] as const,
  find: (query?: FindAccountByQuery) => [...balancesQueryKeys.all, query] as const,
};

export const balancesQueryOptions = {
  find: (query?: FindAccountByQuery) => queryOptions({
    queryKey: balancesQueryKeys.find(query),
    queryFn: () => balancesApi.find(query),
  }),
};

export const useCreateBalanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: balancesApi.create,
      onSuccess: (balance) => {
        queryClient.setQueryData(balancesQueryKeys.all, balance);
      },
    }),
  );
};
