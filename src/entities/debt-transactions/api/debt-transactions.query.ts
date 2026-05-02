import { queryOptions, useQuery } from '@tanstack/react-query';
import { debtTransactionsApi } from './debt-transactions.api';
import type { ListDebtTransactionsQuery } from '../model/schemas';

export const debtTransactionsQueryKeys = {
  all: ['debt-transactions'] as const,
  lists: (debtId: string) => [
    ...debtTransactionsQueryKeys.all,
    debtId,
    'list',
  ] as const,
  list: (debtId: string, query: ListDebtTransactionsQuery) => [
    ...debtTransactionsQueryKeys.lists(debtId),
    query,
  ] as const,
  details: (debtId: string) => [
    ...debtTransactionsQueryKeys.all,
    debtId,
    'detail',
  ] as const,
  detail: (debtId: string, transactionId: string) => [
    ...debtTransactionsQueryKeys.details(debtId),
    transactionId,
  ] as const,
};

export const debtTransactionsQueryOptions = {
  findAll: (
    debtId: string,
    query: ListDebtTransactionsQuery = {},
  ) => queryOptions({
    queryKey: debtTransactionsQueryKeys.list(debtId, query),
    queryFn: () => debtTransactionsApi.findAll(debtId, query),
  }),
  findOne: (debtId: string, transactionId: string) => queryOptions({
    queryKey: debtTransactionsQueryKeys.detail(debtId, transactionId),
    queryFn: () => debtTransactionsApi.findOne(debtId, transactionId),
  }),
};

export const useDebtTransactionsListQuery = (
  debtId: string,
  query: ListDebtTransactionsQuery = {},
) => useQuery(debtTransactionsQueryOptions.findAll(debtId, query));

export const useDebtTransactionQuery = (
  debtId: string,
  transactionId: string,
) => useQuery(debtTransactionsQueryOptions.findOne(debtId, transactionId));
