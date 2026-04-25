import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  periodQuerySchema,
} from '@/shared/api';

export const incomeSchema = z
  .object({
    userId: z.string(),
    amount: z.number().min(0),
    incomeDate: dateStringSchema,
    description: z.string().max(1000).optional(),
    source: z.string().max(255).optional(),
  })
  .extend(entityMetaSchema.shape);

export const createIncomeSchema = z.object({
  amount: z.number().min(0.01),
  incomeDate: dateStringSchema,
  description: z.string().max(1000).optional(),
  source: z.string().max(255).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const listIncomesQuerySchema = paginationQuerySchema.extend(periodQuerySchema.shape);

export const incomeRevenueSchema = z
  .object({ totalRevenue: z.number().min(0) })
  .extend(periodQuerySchema.shape);

export const incomesPaginatedResponseSchema = paginatedResponseSchema(incomeSchema);

export type Income = z.infer<typeof incomeSchema>;
export type IncomeRevenue = z.infer<typeof incomeRevenueSchema>;
export type CreateIncomeDto = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeDto = z.infer<typeof updateIncomeSchema>;
export type ListIncomesQuery = z.infer<typeof listIncomesQuerySchema>;
export type IncomesPaginatedResponse = z.infer<typeof incomesPaginatedResponseSchema>;
