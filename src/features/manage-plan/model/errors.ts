import type { StandardSchemaV1Issue } from '@tanstack/react-form';
import i18next from 'i18next';

export const mapErrorMessage = (code: string | undefined) => {
  switch (code) {
    case 'required':
      return i18next.t('validation.required');
    case 'invalid':
      return i18next.t('validation.amountInvalid');
    case 'min':
      return i18next.t('validation.amountMin');
    case 'tooLong':
      return i18next.t('validation.nameTooLong');
    case 'descriptionTooLong':
      return i18next.t('validation.descriptionTooLong');
    default:
      return undefined;
  }
};

const isStandardSchemaV1Issue = (error: unknown): error is StandardSchemaV1Issue => (
  !!error
  && typeof error === 'object'
  && 'message' in error
);

export const getMutationErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return undefined;
};

export const getFirstFieldError = (errors: unknown[]) => {
  const firstError = errors[0];

  if (typeof firstError === 'string') {
    return firstError;
  }

  if (isStandardSchemaV1Issue(firstError)) {
    return String(firstError.message);
  }

  return undefined;
};
