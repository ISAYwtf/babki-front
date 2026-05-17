import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { expenseLimitsApi } from './expense-limits.api';
import type {
  CreateExpenseLimitDto,
  FindExpenseLimitQuery,
  UpdateExpenseLimitDto,
} from '../model/schemas';

export const expenseLimitsQueryKeys = {
  all: ['expense-limits'] as const,
  listAll: () => [...expenseLimitsQueryKeys.all, 'list'] as const,
  list: (query: FindExpenseLimitQuery) => [...expenseLimitsQueryKeys.listAll(), query] as const,
  details: () => [...expenseLimitsQueryKeys.all, 'detail'] as const,
  detail: (limitId: string) => [...expenseLimitsQueryKeys.details(), limitId] as const,
};

export const expenseLimitsQueryOptions = {
  findAll: (query: FindExpenseLimitQuery) => queryOptions({
    queryKey: expenseLimitsQueryKeys.list(query),
    queryFn: () => expenseLimitsApi.findAll(query),
  }),
  findOne: (limitId: string) => queryOptions({
    queryKey: expenseLimitsQueryKeys.detail(limitId),
    queryFn: () => expenseLimitsApi.findOne(limitId),
  }),
};

export const useCreateExpenseLimitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ payload }: { payload: CreateExpenseLimitDto }) => expenseLimitsApi.create(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: expenseLimitsQueryKeys.all });
      },
    }),
  );
};

export const useUpdateExpenseLimitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        limitId,
        payload,
      }: {
        limitId: string;
        payload: UpdateExpenseLimitDto;
      }) => expenseLimitsApi.update(limitId, payload),
      onSuccess: (category, { limitId }) => {
        queryClient.invalidateQueries({ queryKey: expenseLimitsQueryKeys.listAll() });
        queryClient.setQueryData(expenseLimitsQueryKeys.detail(limitId), category);
      },
    }),
  );
};

export const useDeleteExpenseLimitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: expenseLimitsApi.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: expenseLimitsQueryKeys.listAll() });
      },
    }),
  );
};
