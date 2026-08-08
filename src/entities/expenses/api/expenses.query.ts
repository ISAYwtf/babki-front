import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { snapshotsQueryKeys } from '@/entities/accounts-snapshots/@x/expenses';
import { balancesQueryKeys } from '@/entities/balances/@x/expenses';
import { expenseLimitsQueryKeys } from '@/entities/expense-limits/@x/expenses';
import { reportsQueryKeys } from '@/entities/reports/@x/expenses';
import { transactionsQueryKeys } from '@/entities/transactions/@x/expenses';
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
      onSuccess: (expense) => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: transactionsQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: expenseLimitsQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: balancesQueryKeys.all }),
          ...(expense
            ? [queryClient.invalidateQueries({ queryKey: snapshotsQueryKeys.byAccount(expense.accountId) })]
            : []),
        ]).catch(() => undefined);
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
