import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { expensesApi } from './expenses.api';
import type {
  CreateExpenseDto,
  ListExpensesQuery,
  UpdateExpenseDto,
} from '../model/schemas';

interface DeleteExpenseMutationPayload {
  expenseId: string;
}

interface CreateExpenseMutationPayload {
  payload: CreateExpenseDto;
}

export const expensesQueryKeys = {
  all: ['expenses'] as const,
  lists: () => [...expensesQueryKeys.all, 'list'] as const,
  list: (query: ListExpensesQuery) => [...expensesQueryKeys.lists(), query] as const,
  details: () => [...expensesQueryKeys.all, 'detail'] as const,
  detail: (expenseId: string) => [...expensesQueryKeys.details(), expenseId] as const,
};

export const expensesQueryOptions = {
  findAll: (query: ListExpensesQuery = {}) => queryOptions({
    queryKey: expensesQueryKeys.list(query),
    queryFn: () => expensesApi.findAll(query),
  }),
  findOne: (expenseId: string) => queryOptions({
    queryKey: expensesQueryKeys.detail(expenseId),
    queryFn: () => expensesApi.findOne(expenseId),
  }),
};

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ payload }: CreateExpenseMutationPayload) => expensesApi.create(payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all });
        await queryClient.invalidateQueries({
          queryKey: ['expense-categories'],
        });
      },
    }),
  );
};

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        expenseId,
        payload,
      }: {
        expenseId: string;
        payload: UpdateExpenseDto;
      }) => expensesApi.update(expenseId, payload),
      onSuccess: async (expense, { expenseId }) => {
        queryClient.setQueryData(expensesQueryKeys.detail(expenseId), expense);
        await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.lists() });
      },
    }),
  );
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ expenseId }: DeleteExpenseMutationPayload) => expensesApi.remove(expenseId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.lists() });
      },
    }),
  );
};
