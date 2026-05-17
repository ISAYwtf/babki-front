import type { SnapshotFindByQuery } from '@/entities/accounts-snapshots';
import { queryOptions } from '@tanstack/react-query';
import { snapshotsApi } from './snapshots.api';

const snapshotsQueryKeys = {
  all: ['snapshots'] as const,
  detail: (accountId: string, date: string) => ['snapshots', accountId, date],
};

export const snapshotsQueryOptions = {
  findBy: (params: SnapshotFindByQuery) => queryOptions({
    queryKey: snapshotsQueryKeys.detail(params.accountId, params.date),
    queryFn: () => snapshotsApi.findBy(params),
  }),
};
