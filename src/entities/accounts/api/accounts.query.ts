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
  detail: (asOfDate?: string) => [...accountsQueryKeys.all, asOfDate] as const,
};

export const accountsQueryOptions = {
  findByDate: (asOfDate?: string) => queryOptions({
    queryKey: accountsQueryKeys.detail(asOfDate),
    queryFn: () => accountsApi.findByDate(asOfDate),
  }),
};

export const useUpsertAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ payload }: UpsertAccountMutationPayload) => accountsApi.create(payload),
      onSuccess: (account) => {
        queryClient.setQueryData(accountsQueryKeys.detail(), account);
      },
    }),
  );
};
