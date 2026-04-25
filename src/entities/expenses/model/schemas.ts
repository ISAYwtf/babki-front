import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  objectIdSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
} from '@/shared/api';
import { expenseCategorySchema } from '@/entities/expense-categories/model/schemas';

export const expenseItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const expenseSchema = z
  .object({
    userId: z.string(),
    category: expenseCategorySchema,
    amount: z.number().min(0.01),
    expenseDate: dateStringSchema,
    description: z.string().max(1000).optional(),
    merchant: z.string().max(255).optional(),
    items: expenseItemSchema.array(),
  })
  .extend(entityMetaSchema.shape);

export const createExpenseSchema = z.object({
  categoryId: objectIdSchema,
  amount: z.number().min(0.01),
  expenseDate: dateStringSchema,
  description: z.string().max(1000).optional(),
  merchant: z.string().max(255).optional(),
  items: expenseItemSchema.array().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpensesQuerySchema = paginationQuerySchema.extend({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  categoryId: objectIdSchema.optional(),
});

export const expensesPaginatedResponseSchema = paginatedResponseSchema(expenseSchema);

export type ExpenseItem = z.infer<typeof expenseItemSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type ExpensesPaginatedResponse = z.infer<typeof expensesPaginatedResponseSchema>;
