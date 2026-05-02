import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { savingsApi } from './savings.api';
import type { UpsertSavingDto } from '../model/schemas';

interface UpsertSavingMutationPayload {
  userId: string;
  payload: UpsertSavingDto;
}

const savingsQueryKeys = {
  all: ['savings'] as const,
  detail: (userId: string, asOfDate?: string) => [...savingsQueryKeys.all, userId, asOfDate] as const,
};

export const savingsQueryOptions = {
  findByUserId: (userId: string, asOfDate?: string) => queryOptions({
    queryKey: savingsQueryKeys.detail(userId, asOfDate),
    queryFn: () => savingsApi.findByUserId(userId, asOfDate),
  }),
};

export const useUpsertSavingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ userId, payload }: UpsertSavingMutationPayload) => savingsApi.upsert(userId, payload),
      onSuccess: (account, { userId }) => {
        queryClient.setQueryData(savingsQueryKeys.detail(userId), account);
      },
    }),
  );
};
