import { z } from 'zod';

export const createSaveFormSchema = z
  .object({
    sourceAccountId: z.string().trim().min(1, 'required').max(255, 'tooLong'),
    amount: z
      .string()
      .trim()
      .min(1, 'required')
      .refine((value) => !Number.isNaN(Number(value)), 'invalid')
      .refine((value) => Number(value) >= 0.01, 'min'),
    transactionDate: z.string(),
  });

export type CreateSaveFormValues = z.infer<typeof createSaveFormSchema>;

export const defaultCreateSaveFormValues: CreateSaveFormValues = {
  sourceAccountId: '',
  amount: '',
  transactionDate: '',
};
