import i18next from 'i18next';

export {
  getFirstFieldError,
  getMutationErrorMessage,
} from '@/shared/lib/form-errors';

export const mapErrorMessage = (code: string | undefined) => {
  switch (code) {
    case 'required':
      return i18next.t('validation.required');
    case 'invalid':
      return i18next.t('validation.amountInvalid');
    case 'min':
      return i18next.t('validation.amountMin');
    case 'maxRepayment':
      return i18next.t('validation.repaymentAmountMax');
    case 'tooLong':
      return i18next.t('validation.nameTooLong');
    case 'descriptionTooLong':
      return i18next.t('validation.descriptionTooLong');
    case 'debtDescriptionTooLong':
      return i18next.t('validation.debtDescriptionTooLong');
    case 'repaymentDescriptionTooLong':
      return i18next.t('validation.repaymentDescriptionTooLong');
    default:
      return undefined;
  }
};
