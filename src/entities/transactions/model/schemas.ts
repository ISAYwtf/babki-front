import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
  periodQuerySchema,
} from '@/shared/api';

export const transactionTypeEnum = z.enum(['income', 'expense', 'save']);
export const transactionSchema = z
  .object({
    snapshotId: z.string(),
    accountId: z.string(),
    amount: z.number().min(0),
    transactionDate: dateStringSchema,
    description: z.string().max(1000).optional(),
    type: transactionTypeEnum,
  })
  .extend(entityMetaSchema.shape);

export const createTransactionSchema = z.object({
  amount: z.number().min(0.01),
  transactionDate: dateStringSchema,
  description: z.string().max(1000).optional(),
});

export const updateTransactionSchema = createTransactionSchema.omit({ transactionDate: true }).partial();

export const listTransactionsQuerySchema = paginationQuerySchema
  .extend(periodQuerySchema.shape)
  .extend(transactionSchema.pick({
    snapshotId: true,
    accountId: true,
    type: true,
  }).partial().shape);

export const transactionsRevenueSchema = z
  .object({ totalRevenue: z.number().min(0) })
  .extend(periodQuerySchema.shape);

export const transactionsPaginatedResponseSchema = paginatedResponseSchema(transactionSchema);

export type Transaction = z.infer<typeof transactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
export type TransactionsPaginatedResponse = z.infer<typeof transactionsPaginatedResponseSchema>;
