import { queryOptions, useQuery } from '@tanstack/react-query';
import { reportsApi } from './reports.api';
import type { MonthSummaryQuery, YearSummaryQuery } from '../model/schemas';

export const reportsQueryKeys = {
  all: ['summaries'] as const,
  month: (userId: string, query: MonthSummaryQuery) => [...reportsQueryKeys.all, userId, 'month', query] as const,
  year: (userId: string, query: YearSummaryQuery) => [...reportsQueryKeys.all, userId, 'year', query] as const,
};

export const reportsQueryOptions = {
  monthSummary: (userId: string, query: MonthSummaryQuery) => queryOptions({
    queryKey: reportsQueryKeys.month(userId, query),
    queryFn: () => reportsApi.getMonthlySummary(userId, query),
  }),
  yearSummary: (userId: string, query: YearSummaryQuery) => queryOptions({
    queryKey: reportsQueryKeys.year(userId, query),
    queryFn: () => reportsApi.getYearlySummary(userId, query),
  }),
};

export const useMonthSummaryQuery = (userId: string, query: MonthSummaryQuery) => useQuery(
  reportsQueryOptions.monthSummary(userId, query),
);

export const useYearSummaryQuery = (userId: string, query: YearSummaryQuery) => useQuery(
  reportsQueryOptions.yearSummary(userId, query),
);
