import { queryOptions } from '@tanstack/react-query';
import { snapshotsApi } from './snapshots.api';
import type { SnapshotFindByQuery } from '../model/schemas';

export const snapshotsQueryKeys = {
  all: ['snapshots'] as const,
  byAccount: (accountId: string) => [...snapshotsQueryKeys.all, accountId] as const,
  detail: (accountId: string, date: string) => [...snapshotsQueryKeys.byAccount(accountId), date] as const,
};

export const snapshotsQueryOptions = {
  findBy: (params: SnapshotFindByQuery) => queryOptions({
    queryKey: snapshotsQueryKeys.detail(params.accountId, params.date),
    queryFn: () => snapshotsApi.findBy(params),
  }),
};
