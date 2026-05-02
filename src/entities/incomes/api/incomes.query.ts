import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { incomesApi } from './incomes.api';
import type {
  CreateIncomeDto,
  ListIncomesQuery,
  UpdateIncomeDto,
} from '../model/schemas';

interface DeleteIncomeMutationPayload {
  incomeId: string;
}

interface CreateIncomeMutationPayload {
  payload: CreateIncomeDto;
}

export const incomesQueryKeys = {
  all: ['incomes'] as const,
  lists: () => [...incomesQueryKeys.all, 'list'] as const,
  list: (query: ListIncomesQuery) => [...incomesQueryKeys.lists(), query] as const,
  totalRevenue: (query: ListIncomesQuery) => [
    ...incomesQueryKeys.lists(), query, 'totalRevenue',
  ] as const,
  details: () => [...incomesQueryKeys.all, 'detail'] as const,
  detail: (incomeId: string) => [...incomesQueryKeys.details(), incomeId] as const,
};

export const incomesQueryOptions = {
  findAll: (query: ListIncomesQuery = {}) => queryOptions({
    queryKey: incomesQueryKeys.list(query),
    queryFn: () => incomesApi.findAll(query),
  }),
  findOne: (incomeId: string) => queryOptions({
    queryKey: incomesQueryKeys.detail(incomeId),
    queryFn: () => incomesApi.findOne(incomeId),
  }),
  findTotalRevenue: (query: ListIncomesQuery = {}) => queryOptions({
    queryKey: incomesQueryKeys.totalRevenue(query),
    queryFn: () => incomesApi.findTotalRevenue(query),
  }),
};

export const useCreateIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ payload }: CreateIncomeMutationPayload) => incomesApi.create(payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: incomesQueryKeys.all });
      },
    }),
  );
};

export const useUpdateIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        incomeId,
        payload,
      }: {
        incomeId: string;
        payload: UpdateIncomeDto;
      }) => incomesApi.update(incomeId, payload),
      onSuccess: async (income, { incomeId }) => {
        queryClient.setQueryData(incomesQueryKeys.detail(incomeId), income);
        await queryClient.invalidateQueries({ queryKey: incomesQueryKeys.lists() });
      },
    }),
  );
};

export const useDeleteIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ incomeId }: DeleteIncomeMutationPayload) => incomesApi.remove(incomeId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: incomesQueryKeys.lists() });
      },
    }),
  );
};
