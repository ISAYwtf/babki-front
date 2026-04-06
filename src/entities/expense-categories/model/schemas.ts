import { z } from 'zod';
import { entityMetaSchema } from '@/shared/api';

export const expenseCategorySchema = z
  .object({
    name: z.string().max(100),
    userId: z.string(),
    description: z.string().max(500).optional(),
    color: z.string().regex(/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/).optional(),
    isArchived: z.boolean(),
  })
  .extend(entityMetaSchema.shape);

export const createExpenseCategorySchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/).optional(),
  isArchived: z.boolean().optional(),
});

export const updateExpenseCategorySchema = createExpenseCategorySchema.partial();

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type CreateExpenseCategoryDto = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryDto = z.infer<typeof updateExpenseCategorySchema>;
