import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { debtsApi } from './debts.api';
import type {
  CreateDebtDto,
  ListDebtsQuery,
  RepayDebtDto,
  UpdateDebtDto,
} from '../model/schemas';

export const debtsQueryKeys = {
  all: ['debts'] as const,
  lists: (userId: string) => [...debtsQueryKeys.all, userId, 'list'] as const,
  list: (userId: string, query: ListDebtsQuery) => [...debtsQueryKeys.lists(userId), query] as const,
  details: (userId: string) => [...debtsQueryKeys.all, userId, 'detail'] as const,
  detail: (userId: string, debtId: string) => [...debtsQueryKeys.details(userId), debtId] as const,
};

export const debtsQueryOptions = {
  findAll: (userId: string, query: ListDebtsQuery = {}) => queryOptions({
    queryKey: debtsQueryKeys.list(userId, query),
    queryFn: () => debtsApi.findAll(userId, query),
  }),
  findOne: (userId: string, debtId: string) => queryOptions({
    queryKey: debtsQueryKeys.detail(userId, debtId),
    queryFn: () => debtsApi.findOne(userId, debtId),
  }),
};

export const useCreateDebtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, payload }: { userId: string; payload: CreateDebtDto }) => debtsApi.create(userId, payload),
      onSuccess: async (_, { userId }) => {
        await queryClient.invalidateQueries({ queryKey: debtsQueryKeys.all });
        await queryClient.invalidateQueries({ queryKey: ['summaries', userId] });
      },
    }),
  );
};

export const useUpdateDebtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        userId,
        debtId,
        payload,
      }: {
        userId: string;
        debtId: string;
        payload: UpdateDebtDto;
      }) => debtsApi.update(userId, debtId, payload),
      onSuccess: async (debt, { userId, debtId }) => {
        queryClient.setQueryData(debtsQueryKeys.detail(userId, debtId), debt);
        await queryClient.invalidateQueries({ queryKey: debtsQueryKeys.lists(userId) });
      },
    }),
  );
};

export const useRepayDebtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        userId,
        debtId,
        payload,
      }: {
        userId: string;
        debtId: string;
        payload: RepayDebtDto;
      }) => debtsApi.repay(userId, debtId, payload),
      onSuccess: async (debt, { userId, debtId }) => {
        queryClient.setQueryData(debtsQueryKeys.detail(userId, debtId), debt);
        await queryClient.invalidateQueries({ queryKey: debtsQueryKeys.lists(userId) });
        await queryClient.invalidateQueries({
          queryKey: ['debt-transactions', userId, debtId],
        });
      },
    }),
  );
};

export const useDeleteDebtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, debtId }: { userId: string; debtId: string }) => debtsApi.remove(userId, debtId),
      onSuccess: async (_, { userId }) => {
        await queryClient.invalidateQueries({ queryKey: debtsQueryKeys.lists(userId) });
      },
    }),
  );
};
