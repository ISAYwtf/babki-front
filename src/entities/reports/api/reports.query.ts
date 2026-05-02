import { queryOptions, useQuery } from '@tanstack/react-query';
import { reportsApi } from './reports.api';
import type { MonthSummaryQuery, YearSummaryQuery } from '../model/schemas';

export const reportsQueryKeys = {
  all: ['summaries'] as const,
  month: (query: MonthSummaryQuery) => [...reportsQueryKeys.all, 'month', query] as const,
  year: (query: YearSummaryQuery) => [...reportsQueryKeys.all, 'year', query] as const,
};

export const reportsQueryOptions = {
  monthSummary: (query: MonthSummaryQuery) => queryOptions({
    queryKey: reportsQueryKeys.month(query),
    queryFn: () => reportsApi.getMonthlySummary(query),
  }),
  yearSummary: (query: YearSummaryQuery) => queryOptions({
    queryKey: reportsQueryKeys.year(query),
    queryFn: () => reportsApi.getYearlySummary(query),
  }),
};

export const useMonthSummaryQuery = (query: MonthSummaryQuery) => useQuery(
  reportsQueryOptions.monthSummary(query),
);

export const useYearSummaryQuery = (query: YearSummaryQuery) => useQuery(
  reportsQueryOptions.yearSummary(query),
);
