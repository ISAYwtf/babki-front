import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { accountsApi } from './accounts.api';
import type { UpsertAccountDto } from '../model/schemas';

interface UpsertAccountMutationPayload {
  userId: string;
  payload: UpsertAccountDto;
}

const accountsQueryKeys = {
  all: ['accounts'] as const,
  detail: (userId: string, asOfDate?: string) => [...accountsQueryKeys.all, userId, asOfDate] as const,
};

export const accountsQueryOptions = {
  findByUserId: (userId: string, asOfDate?: string) => queryOptions({
    queryKey: accountsQueryKeys.detail(userId, asOfDate),
    queryFn: () => accountsApi.findByUserId(userId, asOfDate),
  }),
};

export const useUpsertAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, payload }: UpsertAccountMutationPayload) => accountsApi.upsert(userId, payload),
      onSuccess: (account, { userId }) => {
        queryClient.setQueryData(accountsQueryKeys.detail(userId), account);
      },
    }),
  );
};
