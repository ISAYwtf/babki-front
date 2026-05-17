import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  objectIdSchema,
} from '@/shared/api';

export const expenseLimitSchema = z
  .object({
    categoryId: objectIdSchema,
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    total: z.number().positive(),
  })
  .extend(entityMetaSchema.shape);

export const createExpenseLimitSchema = expenseLimitSchema.pick({
  categoryId: true,
  total: true,
}).extend(expenseLimitSchema.pick({
  startDate: true,
  endDate: true,
}).partial());

export const updateExpenseLimitSchema = createExpenseLimitSchema.pick({
  total: true,
});

export const findExpenseLimitQuerySchema = z.object({
  periodDate: dateStringSchema,
}).extend(expenseLimitSchema.pick({
  categoryId: true,
}).partial().shape);

export type ExpenseLimit = z.infer<typeof expenseLimitSchema>;
export type CreateExpenseLimitDto = z.infer<typeof createExpenseLimitSchema>;
export type UpdateExpenseLimitDto = z.infer<typeof updateExpenseLimitSchema>;
export type FindExpenseLimitQuery = z.infer<typeof findExpenseLimitQuerySchema>;
