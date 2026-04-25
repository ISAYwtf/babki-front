import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { usersApi } from './users.api';
import type {
  CreateUserDto,
  ListUsersQuery,
  UpdateUserDto,
} from '../model/schemas';

export const usersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  list: (query: ListUsersQuery) => [...usersQueryKeys.lists(), query] as const,
  details: () => [...usersQueryKeys.all, 'detail'] as const,
  detail: (userId: string) => [...usersQueryKeys.details(), userId] as const,
};

export const usersQueryOptions = {
  findAll: (query: ListUsersQuery = {}) => queryOptions({
    queryKey: usersQueryKeys.list(query),
    queryFn: () => usersApi.findAll(query),
  }),
  findOne: (userId: string) => queryOptions({
    queryKey: usersQueryKeys.detail(userId),
    queryFn: () => usersApi.findOne(userId),
  }),
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: (payload: CreateUserDto) => usersApi.create(payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      },
    }),
  );
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserDto }) => usersApi.update(userId, payload),
      onSuccess: async (user) => {
        await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });

        const updatedUserId = user._id;
        queryClient.setQueryData(usersQueryKeys.detail(updatedUserId), user);
      },
    }),
  );
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: (userId: string) => usersApi.remove(userId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      },
    }),
  );
};
