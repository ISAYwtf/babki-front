import type {
  CategorySelectOption,
} from '@/entities/expense-categories';
import type { ExpenseLimit } from '@/entities/expense-limits';
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { NEW_EXPENSE_LIMIT_ROW_KEY } from './constants';

const DATE_FORMAT = 'yyyy-MM-dd';
const MONEY_FORMAT = /^\d+(?:\.\d{1,2})?$/;

export interface ExpenseLimitDraftValues {
  categoryId: string;
  total: string;
}

export interface ExpenseLimitDraftTouched {
  categoryId: boolean;
  total: boolean;
}

export interface ExpenseLimitDraftMutationError {
  field?: 'categoryId';
  message: string;
}

export interface ExpenseLimitDraft {
  key: string;
  limitId?: string;
  writeConfirmed?: boolean;
  category?: CategorySelectOption;
  baselineTotal: number | null;
  values: ExpenseLimitDraftValues;
}

export interface ExpenseLimitFormValues {
  drafts: ExpenseLimitDraft[];
}

export const emptyExpenseLimitFormValues: ExpenseLimitFormValues = {
  drafts: [],
};

export const parseExpenseLimitTotal = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return undefined;

  const total = Number(normalized);
  return Number.isFinite(total) ? total : undefined;
};

export const hasValidMoneyFormat = (value: string) => MONEY_FORMAT.test(value.trim());

export const createExpenseLimitDraft = (
  limit: ExpenseLimit,
): ExpenseLimitDraft => ({
  key: limit._id,
  limitId: limit._id,
  category: limit.category,
  baselineTotal: limit.total,
  values: {
    categoryId: limit.category._id,
    total: String(limit.total),
  },
});

export const createExpenseLimitDrafts = (
  limits: ExpenseLimit[],
): ExpenseLimitDraft[] => limits.map(createExpenseLimitDraft);

export const createEmptyExpenseLimitDraft = (): ExpenseLimitDraft => ({
  key: NEW_EXPENSE_LIMIT_ROW_KEY,
  baselineTotal: null,
  values: {
    categoryId: '',
    total: '',
  },
});

export const commitExpenseLimitDraftTotal = (
  draft: ExpenseLimitDraft,
  total: number,
): ExpenseLimitDraft => ({
  ...draft,
  baselineTotal: total,
  values: {
    ...draft.values,
    total: String(total),
  },
});

export const createConfirmedExpenseLimitDraft = (
  draft: ExpenseLimitDraft,
  category: CategorySelectOption,
  total: number,
): ExpenseLimitDraft => ({
  ...commitExpenseLimitDraftTotal(draft, total),
  key: `confirmed-${category._id}`,
  writeConfirmed: true,
  category,
});

export const isExpenseLimitDraftDirty = (draft: ExpenseLimitDraft) => {
  if (draft.writeConfirmed) return false;
  if (draft.baselineTotal === null) return true;

  const parsedTotal = parseExpenseLimitTotal(draft.values.total);
  if (parsedTotal === undefined || !hasValidMoneyFormat(draft.values.total)) {
    return true;
  }

  return parsedTotal !== draft.baselineTotal;
};

export const getExpenseLimitMonthRange = (periodDate: string) => {
  const date = parseISO(periodDate);

  return {
    startDate: format(startOfMonth(date), DATE_FORMAT),
    endDate: format(endOfMonth(date), DATE_FORMAT),
  };
};
