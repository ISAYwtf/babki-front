import { z } from 'zod';

export const createPlanFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'required')
    .max(500, 'descriptionTooLong'),
  categoryId: z.string().trim().min(1, 'required'),
  amount: z
    .string()
    .trim()
    .min(1, 'required')
    .refine((value) => !Number.isNaN(Number(value)), 'invalid')
    .refine((value) => Number(value) >= 0.01, 'min'),
  targetDate: z.string().trim().min(1, 'required'),
});

export type CreatePlanFormValues = z.infer<typeof createPlanFormSchema>;

export const defaultCreatePlanFormValues: CreatePlanFormValues = {
  description: '',
  categoryId: '',
  amount: '',
  targetDate: '',
};
