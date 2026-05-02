import { z } from 'zod';
import { dateStringSchema, entityMetaSchema } from '@/shared/api';

export const accountSchema = z
  .object({
    userId: z.string(),
    amount: z.number().min(0),
    asOfDate: dateStringSchema,
  })
  .extend(entityMetaSchema.shape);

export const upsertAccountSchema = z.object({
  currentAccountAmount: z.number().min(0),
  savingsAmount: z.number().min(0),
  asOfDate: dateStringSchema,
});

export type Account = z.infer<typeof accountSchema>;
export type UpsertAccountDto = z.infer<typeof upsertAccountSchema>;
