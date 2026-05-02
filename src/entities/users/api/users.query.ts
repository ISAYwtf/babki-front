import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { usersApi } from './users.api';
import type { UpdateUserDto } from '../model/schemas';

export const usersQueryKeys = {
  all: ['users'] as const,
  me: () => [...usersQueryKeys.all, 'me'] as const,
};

export const usersQueryOptions = {
  me: () => queryOptions({
    queryKey: usersQueryKeys.me(),
    queryFn: () => usersApi.me(),
  }),
};

export const useUpdateCurrentUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: (payload: UpdateUserDto) => usersApi.updateMe(payload),
      onSuccess: async (user) => {
        await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
        queryClient.setQueryData(usersQueryKeys.me(), user);
      },
    }),
  );
};

export const useDeleteCurrentUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: () => usersApi.removeMe(),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      },
    }),
  );
};
