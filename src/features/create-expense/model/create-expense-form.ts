import type { CreateExpenseDto } from '@/entities/expenses';
import { z } from 'zod';

export interface ExpenseItemDraft {
  id: string;
  name: string;
  quantity: string;
  price: string;
}

export interface CreateExpenseFormValues {
  categoryId: string;
  amount: string;
  transactionDate: string;
  merchant: string;
  description: string;
  items: ExpenseItemDraft[];
}

interface AmountInputResult {
  amount: string;
  amountOverridden: boolean;
}

const positiveNumberStringSchema = z
  .string()
  .trim()
  .min(1, 'required')
  .refine((value) => Number.isFinite(Number(value)), 'invalid')
  .refine((value) => Number(value) > 0, 'positive');

const integerQuantityStringSchema = z
  .string()
  .trim()
  .min(1, 'required')
  .refine((value) => Number.isInteger(Number(value)), 'integer')
  .refine((value) => Number(value) >= 1, 'quantityMin');

export const createExpenseFieldSchemas = {
  categoryId: z.string().trim().min(1, 'required'),
  amount: positiveNumberStringSchema,
  transactionDate: z.string().trim().min(1, 'required').pipe(z.iso.date('dateInvalid')),
  merchant: z.string().max(255, 'merchantTooLong'),
  description: z.string().max(1000, 'descriptionTooLong'),
  itemName: z.string().trim().min(1, 'required'),
  itemQuantity: integerQuantityStringSchema,
  itemPrice: positiveNumberStringSchema,
} as const;

export const createExpenseCategoryFieldValidators = {
  onSubmit: createExpenseFieldSchemas.categoryId,
} as const;

export const getExpenseDescriptionValidationError = (
  description: string,
  items: ExpenseItemDraft[],
) => {
  const result = createExpenseFieldSchemas.description.safeParse(description);
  if (!result.success) return result.error.issues[0]?.message;

  return !description.trim() && items.length === 0 ? 'contentRequired' : undefined;
};

export const expenseItemDraftSchema = z.object({
  id: z.string(),
  name: createExpenseFieldSchemas.itemName,
  quantity: createExpenseFieldSchemas.itemQuantity,
  price: createExpenseFieldSchemas.itemPrice,
});

export const createExpenseFormSchema = z
  .object({
    categoryId: createExpenseFieldSchemas.categoryId,
    amount: createExpenseFieldSchemas.amount,
    transactionDate: createExpenseFieldSchemas.transactionDate,
    merchant: createExpenseFieldSchemas.merchant,
    description: createExpenseFieldSchemas.description,
    items: z.array(expenseItemDraftSchema),
  })
  .superRefine((value, context) => {
    if (value.description.trim() || value.items.length > 0) return;

    context.addIssue({
      code: 'custom',
      message: 'contentRequired',
      path: ['description'],
    });
  });

export const createExpenseFormValidationOptions = {
  canSubmitWhenInvalid: true,
  validators: {
    onSubmit: createExpenseFormSchema,
  },
} as const;

const padDatePart = (value: number) => String(value).padStart(2, '0');

export const formatLocalDate = (date: Date) => [
  date.getFullYear(),
  padDatePart(date.getMonth() + 1),
  padDatePart(date.getDate()),
].join('-');

export const getDefaultCreateExpenseFormValues = (
  date = new Date(),
): CreateExpenseFormValues => ({
  categoryId: '',
  amount: '',
  transactionDate: formatLocalDate(date),
  merchant: '',
  description: '',
  items: [],
});

export const createExpenseItemDraft = (): ExpenseItemDraft => ({
  id: crypto.randomUUID(),
  name: '',
  quantity: '1',
  price: '',
});

export const isExpenseItemValid = (item: ExpenseItemDraft) => (
  expenseItemDraftSchema.safeParse(item).success
);

export const changeExpenseItemQuantity = (
  quantity: string,
  change: -1 | 1,
) => {
  const parsedQuantity = Number(quantity);
  const currentQuantity = Number.isInteger(parsedQuantity) && parsedQuantity >= 1
    ? parsedQuantity
    : 1;

  return String(Math.max(1, currentQuantity + change));
};

export const calculateExpenseItemsTotal = (items: ExpenseItemDraft[]) => {
  const amountInMinorUnits = items.reduce((total, item) => {
    const price = Number(item.price);

    if (!Number.isFinite(price) || price <= 0) {
      return total;
    }

    const priceInMinorUnits = Math.round((price + Number.EPSILON) * 100);
    return total + priceInMinorUnits;
  }, 0);

  return amountInMinorUnits > 0 ? String(amountInMinorUnits / 100) : '';
};

export const applyAmountInput = (
  amount: string,
  items: ExpenseItemDraft[],
): AmountInputResult => {
  if (!amount.trim() || Number(amount) === 0) {
    return {
      amount: calculateExpenseItemsTotal(items),
      amountOverridden: false,
    };
  }

  return { amount, amountOverridden: true };
};

export const mapCreateExpenseDto = (
  values: CreateExpenseFormValues,
): CreateExpenseDto => ({
  categoryId: values.categoryId.trim(),
  amount: Number(values.amount),
  transactionDate: values.transactionDate,
  merchant: values.merchant.trim() || undefined,
  description: values.description.trim() || undefined,
  items: values.items.length > 0
    ? values.items.map(({ name, quantity, price }) => ({
      name: name.trim(),
      quantity: Number(quantity),
      price: Number(price),
    }))
    : undefined,
});

export const createExpenseValidationKeys = {
  required: 'validation.required',
  invalid: 'expenses.create.validation.numberInvalid',
  positive: 'expenses.create.validation.positive',
  integer: 'expenses.create.validation.integer',
  quantityMin: 'expenses.create.validation.quantityMin',
  dateInvalid: 'expenses.create.validation.dateInvalid',
  merchantTooLong: 'expenses.create.validation.merchantTooLong',
  descriptionTooLong: 'expenses.create.validation.descriptionTooLong',
  contentRequired: 'expenses.create.validation.contentRequired',
} as const;

export const getCreateExpenseValidationKey = (code: string | undefined) => (
  code && code in createExpenseValidationKeys
    ? createExpenseValidationKeys[code as keyof typeof createExpenseValidationKeys]
    : undefined
);
