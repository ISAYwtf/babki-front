import { queryOptions } from '@tanstack/react-query';
import { reportsApi } from './reports.api';
import type { FindMonthlyReportsByQuery, FindYearlyReportsByQuery } from '../model/schemas';

export const reportsQueryKeys = {
  all: ['reports'] as const,
  monthly: (query?: FindMonthlyReportsByQuery) => [...reportsQueryKeys.all, 'monthly', query],
  yearly: (query?: FindYearlyReportsByQuery) => [...reportsQueryKeys.all, 'yearly', query],
};

export const reportsQueryOptions = {
  monthly: (query?: FindMonthlyReportsByQuery) => queryOptions({
    queryKey: reportsQueryKeys.monthly(query),
    queryFn: () => reportsApi.getMonthly(query),
  }),
  yearly: (query?: FindYearlyReportsByQuery) => queryOptions({
    queryKey: reportsQueryKeys.yearly(query),
    queryFn: () => reportsApi.getYearly(query),
  }),
};
