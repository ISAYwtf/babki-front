import { z } from 'zod';
import {
  dateStringSchema,
} from '@/shared/api';

export const reportPeriodSchema = z
  .object({
    period: dateStringSchema,
    expenses: z.number(),
    incomes: z.number(),
    saves: z.number(),
    saving: z.number(),
    balance: z.number(),
  });

export const findMonthlyReportsByQuerySchema = z.object({
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
});

export type ReportPeriod = z.infer<typeof reportPeriodSchema>;
export type FindMonthlyReportsByQuery = z.infer<typeof findMonthlyReportsByQuerySchema>;
