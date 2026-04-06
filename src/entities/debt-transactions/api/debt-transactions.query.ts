import { queryOptions, useQuery } from '@tanstack/react-query';
import { debtTransactionsApi } from './debt-transactions.api';
import type { ListDebtTransactionsQuery } from '../model/schemas';

export const debtTransactionsQueryKeys = {
  all: ['debt-transactions'] as const,
  lists: (userId: string, debtId: string) => [
    ...debtTransactionsQueryKeys.all,
    userId,
    debtId,
    'list',
  ] as const,
  list: (userId: string, debtId: string, query: ListDebtTransactionsQuery) => [
    ...debtTransactionsQueryKeys.lists(userId, debtId),
    query,
  ] as const,
  details: (userId: string, debtId: string) => [
    ...debtTransactionsQueryKeys.all,
    userId,
    debtId,
    'detail',
  ] as const,
  detail: (userId: string, debtId: string, transactionId: string) => [
    ...debtTransactionsQueryKeys.details(userId, debtId),
    transactionId,
  ] as const,
};

export const debtTransactionsQueryOptions = {
  findAll: (
    userId: string,
    debtId: string,
    query: ListDebtTransactionsQuery = {},
  ) => queryOptions({
    queryKey: debtTransactionsQueryKeys.list(userId, debtId, query),
    queryFn: () => debtTransactionsApi.findAll(userId, debtId, query),
  }),
  findOne: (userId: string, debtId: string, transactionId: string) => queryOptions({
    queryKey: debtTransactionsQueryKeys.detail(userId, debtId, transactionId),
    queryFn: () => debtTransactionsApi.findOne(userId, debtId, transactionId),
  }),
};

export const useDebtTransactionsListQuery = (
  userId: string,
  debtId: string,
  query: ListDebtTransactionsQuery = {},
) => useQuery(debtTransactionsQueryOptions.findAll(userId, debtId, query));

export const useDebtTransactionQuery = (
  userId: string,
  debtId: string,
  transactionId: string,
) => useQuery(debtTransactionsQueryOptions.findOne(userId, debtId, transactionId));
