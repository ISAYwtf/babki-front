import { type Debt, type useUpdateDebtMutation } from '@/entities/debts';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { useForm } from '@tanstack/react-form';
import { LucideCheck } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { editDebtFormSchema, getEditDebtFormValues } from '../model/edit-debt-form';
import { getFirstFieldError, getMutationErrorMessage, mapErrorMessage } from '../model/errors';

interface DebtEditFormProps {
  debt: Debt;
  mutation: ReturnType<typeof useUpdateDebtMutation>;
  onCancel: () => void;
  onSuccess: (updated: Debt | null) => void;
}

export const DebtEditForm: FC<DebtEditFormProps> = ({
  debt,
  mutation,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const mutationError = getMutationErrorMessage(mutation.error);

  const form = useForm({
    defaultValues: getEditDebtFormValues(debt),
    validators: { onSubmit: editDebtFormSchema },
    onSubmit: async ({ value }) => {
      const description = value.description.trim();
      const updated = await mutation.mutateAsync({
        debtId: debt._id,
        payload: {
          debtor: value.debtor.trim(),
          description: description || undefined,
          dueDate: value.dueDate,
        },
      });

      mutation.reset();
      onSuccess(updated);
    },
  });

  const clearMutationError = () => {
    if (mutation.isError) mutation.reset();
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
        <Dialog.Title>{t('debts.edit.title')}</Dialog.Title>
        <div className="flex gap-2.5">
          <Button.Base type="submit" disabled={mutation.isPending}>
            <LucideCheck />
            {mutation.isPending ? t('debts.edit.saving') : t('debts.edit.save')}
          </Button.Base>
          <Button.Base
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            {t('debts.edit.cancel')}
          </Button.Base>
        </div>
      </Dialog.Header>

      <Dialog.Body>
        <form.Field name="debtor">
          {(field) => {
            const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

            return (
              <div>
                <Input.Base
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationError();
                    field.handleChange(event.target.value);
                  }}
                  placeholder={t('debts.edit.fields.debtor')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
                  maxLength={150}
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
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationError();
                    field.handleChange(event.target.value);
                  }}
                  placeholder={t('debts.edit.fields.description')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
                  maxLength={150}
                />
                {fieldError && <Input.Error>{fieldError}</Input.Error>}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="dueDate">
          {(field) => {
            const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

            return (
              <div>
                <Input.Base
                  id="edit-debt-date"
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

        {mutationError && (
          <Typography.Caption1 className="text-destructive">{mutationError}</Typography.Caption1>
        )}
      </Dialog.Body>
    </form>
  );
};
