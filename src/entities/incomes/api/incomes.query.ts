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
  userId: string;
  incomeId: string;
}

interface CreateIncomeMutationPayload {
  userId: string;
  payload: CreateIncomeDto;
}

export const incomesQueryKeys = {
  all: ['incomes'] as const,
  lists: (userId: string) => [...incomesQueryKeys.all, userId, 'list'] as const,
  list: (userId: string, query: ListIncomesQuery) => [...incomesQueryKeys.lists(userId), query] as const,
  details: (userId: string) => [...incomesQueryKeys.all, userId, 'detail'] as const,
  detail: (userId: string, incomeId: string) => [...incomesQueryKeys.details(userId), incomeId] as const,
};

export const incomesQueryOptions = {
  findAll: (userId: string, query: ListIncomesQuery = {}) => queryOptions({
    queryKey: incomesQueryKeys.list(userId, query),
    queryFn: () => incomesApi.findAll(userId, query),
  }),
  findOne: (userId: string, incomeId: string) => queryOptions({
    queryKey: incomesQueryKeys.detail(userId, incomeId),
    queryFn: () => incomesApi.findOne(userId, incomeId),
  }),
  findTotalRevenue: (userId: string, query: ListIncomesQuery = {}) => queryOptions({
    queryKey: incomesQueryKeys.list(userId, query),
    queryFn: () => incomesApi.findTotalRevenue(userId, query),
  }),
};

export const useCreateIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, payload }: CreateIncomeMutationPayload) => incomesApi.create(userId, payload),
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
        userId,
        incomeId,
        payload,
      }: {
        userId: string;
        incomeId: string;
        payload: UpdateIncomeDto;
      }) => incomesApi.update(userId, incomeId, payload),
      onSuccess: async (income, { userId, incomeId }) => {
        queryClient.setQueryData(incomesQueryKeys.detail(userId, incomeId), income);
        await queryClient.invalidateQueries({ queryKey: incomesQueryKeys.lists(userId) });
      },
    }),
  );
};

export const useDeleteIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, incomeId }: DeleteIncomeMutationPayload) => incomesApi.remove(userId, incomeId),
      onSuccess: async (_, { userId }) => {
        await queryClient.invalidateQueries({ queryKey: incomesQueryKeys.lists(userId) });
      },
    }),
  );
};
