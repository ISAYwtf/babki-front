import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
} from '@/shared/api';

export const debtTransactionSchema = z
  .object({
    userId: z.string(),
    debtId: z.string(),
    repaymentAmount: z.number().min(0.01),
    transactionDate: dateStringSchema,
    description: z.string().optional(),
  })
  .extend(entityMetaSchema.shape);

export const listDebtTransactionsQuerySchema = paginationQuerySchema;

export const debtTransactionsPaginatedResponseSchema = paginatedResponseSchema(
  debtTransactionSchema,
);

export type DebtTransaction = z.infer<typeof debtTransactionSchema>;
export type ListDebtTransactionsQuery = z.infer<typeof listDebtTransactionsQuerySchema>;
export type DebtTransactionsPaginatedResponse = z.infer<
  typeof debtTransactionsPaginatedResponseSchema
>;
