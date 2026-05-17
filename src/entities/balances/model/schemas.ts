import {
  accountSchema,
  upsertAccountSchema,
} from '@/entities/accounts';
import { z } from 'zod';

export const balanceSchema = accountSchema.omit({ type: true });
export const upsertBalanceSchema = upsertAccountSchema;

export type Balance = z.infer<typeof balanceSchema>;
export type UpsertBalanceDto = z.infer<typeof upsertBalanceSchema>;
