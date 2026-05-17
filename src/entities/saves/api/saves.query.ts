import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { savesApi } from './saves.api';
import type {
  ListSavesQuery,
  UpdateSaveDto,
} from '../model/schemas';

export const savesQueryKeys = {
  all: ['saves'] as const,
  listAll: () => [...savesQueryKeys.all, 'list'] as const,
  list: (query: ListSavesQuery) => [...savesQueryKeys.listAll(), query] as const,
  totalRevenue: (query: ListSavesQuery) => [
    ...savesQueryKeys.listAll(), query, 'totalRevenue',
  ] as const,
  details: () => [...savesQueryKeys.all, 'detail'] as const,
  detail: (saveId: string) => [...savesQueryKeys.details(), saveId] as const,
};

export const savesQueryOptions = {
  findAll: (query: ListSavesQuery = {}) => queryOptions({
    queryKey: savesQueryKeys.list(query),
    queryFn: () => savesApi.findAll(query),
  }),
  findOne: (saveId: string) => queryOptions({
    queryKey: savesQueryKeys.detail(saveId),
    queryFn: () => savesApi.findOne(saveId),
  }),
  findTotalRevenue: (query: ListSavesQuery = {}) => queryOptions({
    queryKey: savesQueryKeys.totalRevenue(query),
    queryFn: () => savesApi.findTotalRevenue(query),
  }),
};

export const useCreateSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: savesApi.create,
      onSuccess: async (data) => {
        if (data) {
          await queryClient.invalidateQueries({ queryKey: savesQueryKeys.all });
          await queryClient.invalidateQueries({ queryKey: ['savings'] });
          await queryClient.invalidateQueries({ queryKey: ['snapshots', data?.accountId] });
          await queryClient.invalidateQueries({ queryKey: ['snapshots', data?.sourceAccountId] });
        }
      },
    }),
  );
};

export const useUpdateSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({
        saveId,
        payload,
      }: {
        saveId: string;
        payload: UpdateSaveDto;
      }) => savesApi.update(saveId, payload),
      onSuccess: async (save, { saveId }) => {
        queryClient.setQueryData(savesQueryKeys.detail(saveId), save);
        await queryClient.invalidateQueries({ queryKey: savesQueryKeys.listAll() });
        await queryClient.invalidateQueries({ queryKey: ['snapshots', save?.accountId] });
        await queryClient.invalidateQueries({ queryKey: ['snapshots', save?.sourceAccountId] });
      },
    }),
  );
};
