import { z } from 'zod';
import type { Debt } from '@/entities/debts';

export const getRepayDebtFormSchema = (remainingAmount: number) => z.object({
  repaymentDate: z.string().trim().min(1, 'required'),
  amount: z
    .string()
    .trim()
    .min(1, 'required')
    .refine((value) => !Number.isNaN(Number(value)), 'invalid')
    .refine((value) => Number(value) >= 0.01, 'min')
    .refine((value) => Number(value) <= remainingAmount, 'maxRepayment'),
  description: z
    .string()
    .trim()
    .max(1000, 'repaymentDescriptionTooLong'),
  isIncome: z.boolean(),
});

export type RepayDebtFormValues = z.infer<ReturnType<typeof getRepayDebtFormSchema>>;

export const todayDateInputValue = () => new Date().toISOString().slice(0, 10);

export const getRepayDebtFormValues = (debt: Debt): RepayDebtFormValues => ({
  repaymentDate: todayDateInputValue(),
  amount: String(debt.remainingAmount),
  description: '',
  isIncome: true,
});
