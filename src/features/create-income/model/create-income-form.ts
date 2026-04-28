import { z } from 'zod';

export const createIncomeFormSchema = z
  .object({
    source: z.string().trim().min(1, 'required').max(255, 'tooLong'),
    amount: z
      .string()
      .trim()
      .min(1, 'required')
      .refine((value) => !Number.isNaN(Number(value)), 'invalid')
      .refine((value) => Number(value) >= 0.01, 'min'),
    incomeDate: z.string(),
  });

export type CreateIncomeFormValues = z.infer<typeof createIncomeFormSchema>;

export const defaultCreateIncomeFormValues: CreateIncomeFormValues = {
  source: '',
  amount: '',
  incomeDate: '',
};
