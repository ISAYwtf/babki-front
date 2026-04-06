import { z } from 'zod';
import { dateStringSchema, objectIdSchema } from '@/shared/api';

export const monthSummaryQuerySchema = z.object({
  year: z.number().int().min(2000).max(3000),
  month: z.number().int().min(1).max(12),
});

export const yearSummaryQuerySchema = z.object({
  year: z.number().int().min(2000).max(3000),
});

export const reportPeriodSchema = z.object({
  type: z.enum(['month', 'year']),
  year: z.number().int(),
  month: z.number().int().optional(),
  from: dateStringSchema,
  to: dateStringSchema,
});

export const reportExpenseByCategorySchema = z.object({
  categoryId: objectIdSchema,
  categoryName: z.string(),
  totalAmount: z.number().min(0),
  expenseCount: z.number().int().min(0),
});

export const summarySchema = z.object({
  period: reportPeriodSchema,
  currentAccountAmount: z.number().min(0),
  savingsAmount: z.number().min(0),
  totalExpenses: z.number().min(0),
  expenseCount: z.number().int().min(0),
  expensesByCategory: z.array(reportExpenseByCategorySchema),
  totalActiveDebtRemaining: z.number().min(0),
  activeDebtCount: z.number().int().min(0),
});

export type MonthSummaryQuery = z.infer<typeof monthSummaryQuerySchema>;
export type YearSummaryQuery = z.infer<typeof yearSummaryQuerySchema>;
export type Summary = z.infer<typeof summarySchema>;
