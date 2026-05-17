import {
  mutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { accountsApi } from './accounts.api';

const accountsQueryKeys = {
  all: ['accounts'] as const,
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: accountsApi.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: accountsQueryKeys.all });
      },
    }),
  );
};
