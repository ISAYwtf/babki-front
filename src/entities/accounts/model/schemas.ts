import { snapshotSchema } from '@/entities/accounts-snapshots';
import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
} from '@/shared/api';

export const accountTypeEnum = z.enum(['balance', 'saving']);

export const accountSchema = z
  .object({
    amount: z.number().min(0),
    timeline: snapshotSchema.array(),
    type: accountTypeEnum,
  })
  .extend(entityMetaSchema.shape);

export const upsertAccountSchema = accountSchema.pick({ amount: true });

export const findAccountByQuerySchema = z.object({
  toDate: dateStringSchema.optional(),
});

export type Account = z.infer<typeof accountSchema>;
export type AccountType = z.infer<typeof accountTypeEnum>;
export type UpsertAccountDto = z.infer<typeof upsertAccountSchema>;
export type FindAccountByQuery = z.infer<typeof findAccountByQuerySchema>;
