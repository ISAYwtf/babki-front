import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { expensesApi } from './expenses.api';
import type {
  CreateExpenseDto,
  ListExpensesQuery,
  UpdateExpenseDto,
} from '../model/schemas';

interface DeleteExpenseMutationPayload {
  userId: string;
  expenseId: string;
}

interface CreateExpenseMutationPayload {
  userId: string;
  payload: CreateExpenseDto;
}

export const expensesQueryKeys = {
  all: ['expenses'] as const,
  lists: (userId: string) => [...expensesQueryKeys.all, userId, 'list'] as const,
  list: (userId: string, query: ListExpensesQuery) => [...expensesQueryKeys.lists(userId), query] as const,
  details: (userId: string) => [...expensesQueryKeys.all, userId, 'detail'] as const,
  detail: (userId: string, expenseId: string) => [...expensesQueryKeys.details(userId), expenseId] as const,
};

export const expensesQueryOptions = {
  findAll: (userId: string, query: ListExpensesQuery = {}) => queryOptions({
    queryKey: expensesQueryKeys.list(userId, query),
    queryFn: () => expensesApi.findAll(userId, query),
  }),
  findOne: (userId: string, expenseId: string) => queryOptions({
    queryKey: expensesQueryKeys.detail(userId, expenseId),
    queryFn: () => expensesApi.findOne(userId, expenseId),
  }),
};

export const useExpensesListQuery = (userId: string, query: ListExpensesQuery = {}) => useQuery(
  expensesQueryOptions.findAll(userId, query),
);

export const useExpenseQuery = (userId: string, expenseId: string) => useQuery(
  expensesQueryOptions.findOne(userId, expenseId),
);

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, payload }: CreateExpenseMutationPayload) => expensesApi.create(userId, payload),
      onSuccess: async (_, { userId }) => {
        await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all });
        await queryClient.invalidateQueries({
          queryKey: ['expense-categories', userId],
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
        userId,
        expenseId,
        payload,
      }: {
        userId: string;
        expenseId: string;
        payload: UpdateExpenseDto;
      }) => expensesApi.update(userId, expenseId, payload),
      onSuccess: async (expense, { userId, expenseId }) => {
        queryClient.setQueryData(expensesQueryKeys.detail(userId, expenseId), expense);
        await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.lists(userId) });
      },
    }),
  );
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, expenseId }: DeleteExpenseMutationPayload) => expensesApi.remove(userId, expenseId),
      onSuccess: async (_, { userId }) => {
        await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.lists(userId) });
      },
    }),
  );
};
