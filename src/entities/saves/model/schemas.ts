import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  transactionSchema,
  transactionsRevenueSchema,
} from '@/entities/transactions';
import { z } from 'zod';
import {
  entityMetaSchema,
  objectIdSchema,
  paginatedResponseSchema,
} from '@/shared/api';

export const saveSchema = z
  .object({
    sourceAccountId: objectIdSchema,
  })
  .extend(transactionSchema.shape)
  .extend(entityMetaSchema.shape);

export const createSaveSchema = z.object({
  sourceAccountId: objectIdSchema,
}).extend(createTransactionSchema.shape);

export const updateSaveSchema = createSaveSchema
  .omit({ transactionDate: true })
  .partial();

export const listSavesQuerySchema = listTransactionsQuerySchema;

export const saveRevenueSchema = transactionsRevenueSchema;

export const savesPaginatedResponseSchema = paginatedResponseSchema(saveSchema);

export type Save = z.infer<typeof saveSchema>;
export type SaveRevenue = z.infer<typeof saveRevenueSchema>;
export type CreateSaveDto = z.infer<typeof createSaveSchema>;
export type UpdateSaveDto = z.infer<typeof updateSaveSchema>;
export type ListSavesQuery = z.infer<typeof listSavesQuerySchema>;
export type SavesPaginatedResponse = z.infer<typeof savesPaginatedResponseSchema>;
