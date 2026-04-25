import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { expenseCategoriesApi } from './expense-categories.api';
import type {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from '../model/schemas';

interface DeleteExpenseCategoryMutationPayload {
  userId: string;
  categoryId: string;
}

const deleteExpenseCategoryMutationFn = ({
  userId,
  categoryId,
}: DeleteExpenseCategoryMutationPayload) => expenseCategoriesApi.remove(userId, categoryId);

export const expenseCategoriesQueryKeys = {
  all: ['expense-categories'] as const,
  lists: (userId: string) => [...expenseCategoriesQueryKeys.all, userId, 'list'] as const,
  details: (userId: string) => [...expenseCategoriesQueryKeys.all, userId, 'detail'] as const,
  detail: (userId: string, categoryId: string) => [...expenseCategoriesQueryKeys.details(userId), categoryId] as const,
};

export const expenseCategoriesQueryOptions = {
  findAll: (userId: string) => queryOptions({
    queryKey: expenseCategoriesQueryKeys.lists(userId),
    queryFn: () => expenseCategoriesApi.findAll(userId),
  }),
  findOne: (userId: string, categoryId: string) => queryOptions({
    queryKey: expenseCategoriesQueryKeys.detail(userId, categoryId),
    queryFn: () => expenseCategoriesApi.findOne(userId, categoryId),
  }),
};

export const useCreateExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        userId,
        payload,
      }: {
        userId: string;
        payload: CreateExpenseCategoryDto;
      }) => expenseCategoriesApi.create(userId, payload),
      onSuccess: async (_, { userId }) => {
        await queryClient.invalidateQueries({
          queryKey: expenseCategoriesQueryKeys.all,
        });
        await queryClient.invalidateQueries({ queryKey: ['expenses', userId] });
      },
    }),
  );
};

export const useUpdateExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        userId,
        categoryId,
        payload,
      }: {
        userId: string;
        categoryId: string;
        payload: UpdateExpenseCategoryDto;
      }) => expenseCategoriesApi.update(userId, categoryId, payload),
      onSuccess: async (category, { userId, categoryId }) => {
        await queryClient.invalidateQueries({
          queryKey: expenseCategoriesQueryKeys.lists(userId),
        });
        queryClient.setQueryData(
          expenseCategoriesQueryKeys.detail(userId, categoryId),
          category,
        );
      },
    }),
  );
};

export const useDeleteExpenseCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: deleteExpenseCategoryMutationFn,
      onSuccess: async (_, { userId }) => {
        await queryClient.invalidateQueries({
          queryKey: expenseCategoriesQueryKeys.lists(userId),
        });
      },
    }),
  );
};
