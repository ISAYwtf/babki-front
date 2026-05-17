import {
  accountSchema,
  upsertAccountSchema,
} from '@/entities/accounts';
import { z } from 'zod';

export const savingSchema = accountSchema.omit({ type: true });
export const upsertSavingSchema = upsertAccountSchema;

export type Saving = z.infer<typeof savingSchema>;
export type UpsertSavingDto = z.infer<typeof upsertSavingSchema>;
