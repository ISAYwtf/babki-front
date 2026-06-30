import { type Debt, type useRepayDebtMutation } from '@/entities/debts';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { useForm } from '@tanstack/react-form';
import { LucideCheck } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { getFirstFieldError, getMutationErrorMessage, mapErrorMessage } from '../model/errors';
import {
  getRepayDebtFormSchema,
  getRepayDebtFormValues,
} from '../model/repay-debt-form';

interface DebtRepayFormProps {
  debt: Debt;
  mutation: ReturnType<typeof useRepayDebtMutation>;
  onCancel: () => void;
  onSuccess: (updated: Debt | null) => void;
}

export const DebtRepayForm: FC<DebtRepayFormProps> = ({
  debt,
  mutation,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const mutationError = getMutationErrorMessage(mutation.error);

  const form = useForm({
    defaultValues: getRepayDebtFormValues(debt),
    validators: { onSubmit: getRepayDebtFormSchema(debt.remainingAmount) },
    onSubmit: async ({ value }) => {
      const description = value.description.trim();
      const updated = await mutation.mutateAsync({
        debtId: debt._id,
        payload: {
          repaymentDate: value.repaymentDate,
          amount: Number(value.amount),
          description: description || undefined,
        },
      });

      mutation.reset();
      onSuccess(updated);
    },
  });

  const clearMutationError = () => {
    if (mutation.isError) mutation.reset();
  };

  const handleReset = () => {
    clearMutationError();
    form.reset(getRepayDebtFormValues(debt));
  };

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <Dialog.Header>
        <Dialog.Title>{t('debts.repay.title')}</Dialog.Title>
        <div className="flex gap-2.5">
          <Button.Base type="submit" disabled={mutation.isPending}>
            <LucideCheck />
            {mutation.isPending ? t('debts.repay.repaying') : t('debts.repay.confirm')}
          </Button.Base>
          <Button.Base
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            {t('debts.repay.cancel')}
          </Button.Base>
        </div>
      </Dialog.Header>

      <Dialog.Body>
        <Dialog.Description>{t('debts.repay.description')}</Dialog.Description>

        <form.Field name="repaymentDate">
          {(field) => {
            const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

            return (
              <div>
                <Input.Base
                  id="repay-debt-date"
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationError();
                    field.handleChange(event.target.value);
                  }}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
                />
                {fieldError && <Input.Error>{fieldError}</Input.Error>}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="amount">
          {(field) => {
            const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

            return (
              <div>
                <Input.Base
                  id="repay-debt-amount"
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max={debt.remainingAmount}
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationError();
                    field.handleChange(event.target.value);
                  }}
                  placeholder={t('debts.repay.fields.amount')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
                />
                {fieldError && <Input.Error>{fieldError}</Input.Error>}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

            return (
              <div>
                <Input.Base
                  id="repay-debt-description"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationError();
                    field.handleChange(event.target.value);
                  }}
                  placeholder={t('debts.repay.fields.description')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
                  maxLength={1000}
                />
                {fieldError && <Input.Error>{fieldError}</Input.Error>}
              </div>
            );
          }}
        </form.Field>

        <div className="flex justify-end">
          <Button.Base
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={mutation.isPending}
          >
            {t('debts.repay.reset')}
          </Button.Base>
        </div>

        {mutationError && (
          <Typography.Caption1 className="text-destructive">{mutationError}</Typography.Caption1>
        )}
      </Dialog.Body>
    </form>
  );
};
