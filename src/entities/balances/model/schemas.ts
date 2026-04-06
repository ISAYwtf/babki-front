import { z } from 'zod';
import { dateStringSchema, entityMetaSchema } from '@/shared/api';

export const balanceSchema = z
  .object({
    userId: z.string(),
    currentAccountAmount: z.number().min(0),
    savingsAmount: z.number().min(0),
    asOfDate: dateStringSchema,
  })
  .extend(entityMetaSchema.shape);

export const upsertBalanceSchema = z.object({
  currentAccountAmount: z.number().min(0),
  savingsAmount: z.number().min(0),
  asOfDate: dateStringSchema,
});

export type Balance = z.infer<typeof balanceSchema>;
export type UpsertBalanceDto = z.infer<typeof upsertBalanceSchema>;
