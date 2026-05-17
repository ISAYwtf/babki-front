import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { transactionsApi } from './transactions.api';
import type { ListTransactionsQuery } from '../model/schemas';

interface DeleteIncomeMutationPayload {
  transactionId: string;
}

export const transactionsQueryKeys = {
  all: ['transactions'] as const,
  listAll: () => [...transactionsQueryKeys.all, 'list'] as const,
  list: (query: ListTransactionsQuery) => [...transactionsQueryKeys.listAll(), query] as const,
  details: () => [...transactionsQueryKeys.all, 'detail'] as const,
  detail: (transactionId: string) => [...transactionsQueryKeys.details(), transactionId] as const,
};

export const transactionsQueryOptions = {
  findAll: (query: ListTransactionsQuery = {}) => queryOptions({
    queryKey: transactionsQueryKeys.list(query),
    queryFn: () => transactionsApi.findAll(query),
  }),
  findOne: (transactionId: string) => queryOptions({
    queryKey: transactionsQueryKeys.detail(transactionId),
    queryFn: () => transactionsApi.findOne(transactionId),
  }),
};

export const useDeleteIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ transactionId }: DeleteIncomeMutationPayload) => transactionsApi.delete(transactionId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: transactionsQueryKeys.listAll() });
      },
    }),
  );
};
