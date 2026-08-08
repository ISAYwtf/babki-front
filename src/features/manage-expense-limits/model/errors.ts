import { isAxiosError } from 'axios';
import i18next from 'i18next';
import type {
  ExpenseLimitDraftFieldError,
} from './validation';

export const isDuplicateExpenseLimitError = (error: unknown) => (
  isAxiosError(error)
  && error.response?.status === 409
);

export const getExpenseLimitMutationErrorMessage = () => (
  i18next.t('expenseLimits.management.errors.generic')
);

export const getUnavailableExpenseLimitCategoryMessage = () => (
  i18next.t('expenseLimits.management.validation.unavailableCategory')
);

export const mapExpenseLimitFieldError = (
  error: ExpenseLimitDraftFieldError | undefined,
) => {
  switch (error) {
    case 'required':
      return i18next.t('validation.required');
    case 'invalid':
      return i18next.t('validation.amountInvalid');
    case 'min':
      return i18next.t('validation.amountMin');
    case 'precision':
      return i18next.t('expenseLimits.management.validation.amountPrecision');
    case 'duplicate':
      return i18next.t('expenseLimits.management.validation.duplicateCategory');
    default:
      return undefined;
  }
};
