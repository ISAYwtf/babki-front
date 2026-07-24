import {
  mutationOptions, queryOptions, useMutation, useQueryClient,
} from '@tanstack/react-query';
import { expensesQueryKeys } from '@/entities/expenses/@x/plans';
import { reportsQueryKeys } from '@/entities/reports/@x/plans';
import { plansApi } from './plans.api';
import type { ClosePlanPayload, ListPlansQuery, UpdatePlanPayload } from '../model/schemas';

export const plansQueryKeys = {
  all: ['plans'] as const,
  listAll: () => [...plansQueryKeys.all, 'list'] as const,
  list: (query: ListPlansQuery) => [...plansQueryKeys.listAll(), query] as const,
};

export const plansQueryOptions = {
  findAll: (query: ListPlansQuery = {}) => queryOptions({
    queryKey: plansQueryKeys.list(query),
    queryFn: () => plansApi.findAll(query),
  }),
};

export const useCreatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: plansApi.create,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() });
      },
    }),
  );
};

export const useUpdatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ planId, payload }: { planId: string; payload: UpdatePlanPayload }) => (
        plansApi.update(planId, payload)
      ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() });
      },
    }),
  );
};

export const useRemovePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: plansApi.remove,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() });
      },
    }),
  );
};

export const useClosePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ planId, payload }: { planId: string; payload: ClosePlanPayload }) => (
        plansApi.close(planId, payload)
      ),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() }),
          queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all }),
        ]);
      },
    }),
  );
};
