import { endOfMonth, format } from 'date-fns';
import { z } from 'zod';

export const createDebtFormSchema = z
  .object({
    debtor: z.string().trim().min(1, 'required').max(150, 'tooLong'),
    amount: z
      .string()
      .trim()
      .min(1, 'required')
      .refine((value) => !Number.isNaN(Number(value)), 'invalid')
      .refine((value) => Number(value) >= 0.01, 'min'),
    dateMode: z.enum(['day', 'month']),
    dayDate: z.string(),
    monthDate: z.string(),
  })
  .superRefine((values, ctx) => {
    const dateValue = values.dateMode === 'day' ? values.dayDate : values.monthDate;

    if (!dateValue) {
      ctx.addIssue({
        code: 'custom',
        message: 'required',
        path: [values.dateMode === 'day' ? 'dayDate' : 'monthDate'],
      });
    }
  });

export type CreateDebtFormValues = z.infer<typeof createDebtFormSchema>;

export const defaultCreateDebtFormValues: CreateDebtFormValues = {
  debtor: '',
  amount: '',
  dateMode: 'day',
  dayDate: '',
  monthDate: '',
};

export const normalizeDueDate = (values: CreateDebtFormValues) => {
  if (values.dateMode === 'month') {
    return format(endOfMonth(new Date(`${values.monthDate}-01`)), 'yyyy-MM-dd');
  }

  return values.dayDate;
};
