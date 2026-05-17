import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { expensesApi } from './expenses.api';
import type {
  ListExpensesQuery,
  UpdateExpenseDto,
} from '../model/schemas';

export const expensesQueryKeys = {
  all: ['expenses'] as const,
  listAll: () => [...expensesQueryKeys.all, 'list'] as const,
  list: (query: ListExpensesQuery) => [...expensesQueryKeys.listAll(), query] as const,
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
      mutationFn: expensesApi.create,
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
        await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.listAll() });
      },
    }),
  );
};
