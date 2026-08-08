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

const createExpenseLimitMutationFn = async (
  payload: CreateExpenseLimitDto,
) => {
  const createdLimit = await expenseLimitsApi.create(payload);
  if (createdLimit) return createdLimit;

  const periodDate = payload.startDate ?? payload.endDate;
  if (!periodDate) return null;

  const limits = await expenseLimitsApi.findAll({ periodDate }).catch(() => null);
  return limits?.find((limit) => limit.category._id === payload.categoryId) ?? null;
};

const updateExpenseLimitMutationFn = async (
  limitId: string,
  payload: UpdateExpenseLimitDto,
) => {
  const updatedLimit = await expenseLimitsApi.update(limitId, payload);
  if (updatedLimit) return updatedLimit;

  return expenseLimitsApi.findOne(limitId).catch(() => null);
};

export const useCreateExpenseLimitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        payload,
      }: {
        payload: CreateExpenseLimitDto;
      }) => createExpenseLimitMutationFn(payload),
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
      }) => updateExpenseLimitMutationFn(limitId, payload),
      onSuccess: (updatedLimit, { limitId }) => {
        queryClient.invalidateQueries({ queryKey: expenseLimitsQueryKeys.listAll() });
        if (updatedLimit) {
          queryClient.setQueryData(expenseLimitsQueryKeys.detail(limitId), updatedLimit);
        } else {
          queryClient.invalidateQueries({ queryKey: expenseLimitsQueryKeys.detail(limitId) });
        }
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
