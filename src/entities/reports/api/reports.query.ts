import type { FindMonthlyReportsByQuery } from '@/entities/reports';
import { queryOptions } from '@tanstack/react-query';
import { reportsApi } from './reports.api';

const reportsQueryKeys = {
  all: ['reports'] as const,
  monthly: (query?: FindMonthlyReportsByQuery) => [...reportsQueryKeys.all, 'monthly', query],
  yearly: () => [...reportsQueryKeys.all, 'yearly'],
};

export const reportsQueryOptions = {
  monthly: (query?: FindMonthlyReportsByQuery) => queryOptions({
    queryKey: reportsQueryKeys.monthly(query),
    queryFn: () => reportsApi.getMonthly(query),
  }),
  yearly: () => queryOptions({
    queryKey: reportsQueryKeys.yearly(),
    queryFn: reportsApi.getYearly,
  }),
};
