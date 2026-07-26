import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { expenseLimitsQueryKeys } from '@/entities/expense-limits/@x/expense-categories';
import { expensesQueryKeys } from '@/entities/expenses/@x/expense-categories';
import { expenseCategoriesApi } from './expense-categories.api';
import type {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from '../model/schemas';

interface DeleteExpenseCategoryMutationPayload {
  categoryId: string;
}

const deleteExpenseCategoryMutationFn = ({
  categoryId,
}: DeleteExpenseCategoryMutationPayload) => expenseCategoriesApi.remove(categoryId);

export const expenseCategoriesQueryKeys = {
  all: ['expense-categories'] as const,
  lists: () => [...expenseCategoriesQueryKeys.all, 'list'] as const,
  details: () => [...expenseCategoriesQueryKeys.all, 'detail'] as const,
  detail: (categoryId: string) => [...expenseCategoriesQueryKeys.details(), categoryId] as const,
};

export const expenseCategoriesQueryOptions = {
  findAll: () => queryOptions({
    queryKey: expenseCategoriesQueryKeys.lists(),
    queryFn: () => expenseCategoriesApi.findAll(),
  }),
  findOne: (categoryId: string) => queryOptions({
    queryKey: expenseCategoriesQueryKeys.detail(categoryId),
    queryFn: () => expenseCategoriesApi.findOne(categoryId),
  }),
};

export const useCreateExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ payload }: { payload: CreateExpenseCategoryDto }) => expenseCategoriesApi.create(payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: expenseCategoriesQueryKeys.all,
        });
      },
    }),
  );
};

export const useUpdateExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        categoryId,
        payload,
      }: {
        categoryId: string;
        payload: UpdateExpenseCategoryDto;
      }) => expenseCategoriesApi.update(categoryId, payload),
      onSuccess: async (category, { categoryId }) => {
        queryClient.setQueryData(
          expenseCategoriesQueryKeys.detail(categoryId),
          category,
        );
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: expenseCategoriesQueryKeys.lists(),
          }),
          queryClient.invalidateQueries({
            queryKey: expensesQueryKeys.listAll(),
          }),
          queryClient.invalidateQueries({
            queryKey: expenseLimitsQueryKeys.listAll(),
          }),
        ]);
      },
    }),
  );
};

export const useDeleteExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: deleteExpenseCategoryMutationFn,
      onSuccess: async (_, { categoryId }) => {
        queryClient.removeQueries({
          queryKey: expenseCategoriesQueryKeys.detail(categoryId),
          exact: true,
        });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: expenseCategoriesQueryKeys.lists(),
          }),
          queryClient.invalidateQueries({
            queryKey: expenseLimitsQueryKeys.listAll(),
          }),
        ]);
      },
    }),
  );
};
