import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionSchema,
} from '@/entities/transactions';
import { z } from 'zod';
import {
  entityMetaSchema,
  objectIdSchema,
  paginatedResponseSchema,
} from '@/shared/api';
import { expenseCategorySchema } from '@/entities/expense-categories/model/schemas';

export const expenseItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const expenseSchema = z
  .object({
    category: expenseCategorySchema,
    merchant: z.string().max(255).optional(),
    items: expenseItemSchema.array(),
  })
  .extend(transactionSchema.shape)
  .extend(entityMetaSchema.shape);

export const createExpenseSchema = z.object({
  categoryId: objectIdSchema,
  merchant: z.string().max(255).optional(),
  items: expenseItemSchema.array().optional(),
}).extend(createTransactionSchema.shape);

export const updateExpenseSchema = createExpenseSchema
  .omit({ transactionDate: true })
  .partial();

export const listExpensesQuerySchema = z.object({
  categoryId: objectIdSchema.optional(),
}).extend(listTransactionsQuerySchema.shape);

export const expensesPaginatedResponseSchema = paginatedResponseSchema(expenseSchema);

export type ExpenseItem = z.infer<typeof expenseItemSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type ExpensesPaginatedResponse = z.infer<typeof expensesPaginatedResponseSchema>;
