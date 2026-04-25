import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { balancesApi } from './balances.api';
import type { UpsertBalanceDto } from '../model/schemas';

interface UpsertBalanceMutationPayload {
  userId: string;
  payload: UpsertBalanceDto;
}

export const balancesQueryKeys = {
  all: ['balances'] as const,
  detail: (userId: string, asOfDate?: string) => [...balancesQueryKeys.all, userId, asOfDate] as const,
};

export const balancesQueryOptions = {
  findByUserId: (userId: string, asOfDate?: string) => queryOptions({
    queryKey: balancesQueryKeys.detail(userId, asOfDate),
    queryFn: () => balancesApi.findByUserId(userId, asOfDate),
  }),
};

export const useBalanceQuery = (userId: string) => useQuery(balancesQueryOptions.findByUserId(userId));

export const useUpsertBalanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, payload }: UpsertBalanceMutationPayload) => balancesApi.upsert(userId, payload),
      onSuccess: (balance, { userId }) => {
        queryClient.setQueryData(balancesQueryKeys.detail(userId), balance);
      },
    }),
  );
};
