import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
} from '@/shared/api';

export const debtStatusSchema = z.enum(['active', 'closed']);

const amountWithCentsSchema = z
  .number()
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(String(value)), 'maxDecimalPlaces');

export const debtSchema = z
  .object({
    debtor: z.string().max(150),
    principalAmount: amountWithCentsSchema.min(0.01),
    remainingAmount: amountWithCentsSchema.min(0),
    description: z.string().max(150).optional(),
    dueDate: dateStringSchema.optional(),
    status: debtStatusSchema,
  })
  .extend(entityMetaSchema.shape);

export const createDebtSchema = z.object({
  debtor: z.string().max(150),
  principalAmount: amountWithCentsSchema.min(0.01),
  remainingAmount: amountWithCentsSchema.min(0),
  description: z.string().max(150).optional(),
  dueDate: dateStringSchema.optional(),
  status: debtStatusSchema.optional(),
});

export const updateDebtSchema = createDebtSchema.partial();

export const repayDebtSchema = z.object({
  repaymentDate: dateStringSchema,
  amount: amountWithCentsSchema.min(0.01),
  description: z.string().max(1000).optional(),
  isIncome: z.boolean().optional(),
});

export const listDebtsQuerySchema = paginationQuerySchema.extend({
  status: debtStatusSchema.optional(),
});

export const debtsPaginatedResponseSchema = paginatedResponseSchema(debtSchema);

export type Debt = z.infer<typeof debtSchema>;
export type DebtStatus = z.infer<typeof debtStatusSchema>;
export type CreateDebtDto = z.infer<typeof createDebtSchema>;
export type UpdateDebtDto = z.infer<typeof updateDebtSchema>;
export type RepayDebtDto = z.infer<typeof repayDebtSchema>;
export type ListDebtsQuery = z.infer<typeof listDebtsQuerySchema>;
export type DebtsPaginatedResponse = z.infer<typeof debtsPaginatedResponseSchema>;
