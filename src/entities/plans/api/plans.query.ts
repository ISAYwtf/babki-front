import { queryOptions } from '@tanstack/react-query';
import { plansApi } from './plans.api';
import type { ListPlansQuery } from '../model/schemas';

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
