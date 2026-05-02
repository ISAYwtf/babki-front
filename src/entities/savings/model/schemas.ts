import { z } from 'zod';
import { dateStringSchema, entityMetaSchema } from '@/shared/api';

export const savingSchema = z
  .object({
    userId: z.string(),
    amount: z.number().min(0),
    asOfDate: dateStringSchema.optional(),
    history: z.array(z.unknown()).optional(),
  })
  .extend(entityMetaSchema.shape);

export const upsertSavingSchema = z.object({
  currentAccountAmount: z.number().min(0),
  amount: z.number().min(0),
  asOfDate: dateStringSchema,
});

export type Saving = z.infer<typeof savingSchema>;
export type UpsertSavingDto = z.infer<typeof upsertSavingSchema>;
