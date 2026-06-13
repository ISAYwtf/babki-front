import { z } from 'zod';
import {
  dateStringSchema,
  objectIdSchema,
} from '@/shared/api';

export const reportPeriodSchema = z
  .object({
    period: dateStringSchema,
    expenses: z.number(),
    incomes: z.number(),
    saves: z.number(),
    saving: z.number(),
    balance: z.number(),
    expensesByCategory: z.array(
      z.object({
        categoryId: objectIdSchema,
        total: z.number(),
      }),
    ).default([]),
  });

export const findMonthlyReportsByQuerySchema = z.object({
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
  categories: z.array(objectIdSchema).optional(),
});

export const findYearlyReportsByQuerySchema = z.object({
  categories: z.array(objectIdSchema).optional(),
});

export type ReportPeriod = z.infer<typeof reportPeriodSchema>;
export type FindMonthlyReportsByQuery = z.infer<typeof findMonthlyReportsByQuerySchema>;
export type FindYearlyReportsByQuery = z.infer<typeof findYearlyReportsByQuerySchema>;
