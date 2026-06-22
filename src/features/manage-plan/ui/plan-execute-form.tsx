import { type Plan, type useClosePlanMutation } from '@/entities/plans';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { LucideCheck } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  executePlanFormSchema,
  getExecutePlanFormValues,
} from '../model/execute-plan-form';
import { getFirstFieldError, getMutationErrorMessage, mapErrorMessage } from '../model/errors';

interface PlanExecuteFormProps {
  plan: Plan;
  mutation: ReturnType<typeof useClosePlanMutation>;
  onCancel: () => void;
  onSuccess: () => void;
}

export const PlanExecuteForm: FC<PlanExecuteFormProps> = ({
  plan,
  mutation,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const mutationError = getMutationErrorMessage(mutation.error);

  const form = useForm({
    defaultValues: getExecutePlanFormValues(plan),
    validators: { onSubmit: executePlanFormSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        planId: plan._id,
        payload: {
          closingDate: value.closingDate,
          amount: Number(value.amount),
          description: value.description.trim(),
        },
      });

      mutation.reset();
      onSuccess();
    },
  });

  const clearMutationError = () => {
    if (mutation.isError) mutation.reset();
  };

  const handleReset = () => {
    clearMutationError();
    form.reset(getExecutePlanFormValues(plan));
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
        <Dialog.Title>{t('plans.execute.title')}</Dialog.Title>
        <div className="flex gap-2.5">
          <Button.Base type="submit" disabled={mutation.isPending}>
            <LucideCheck />
            {mutation.isPending ? t('plans.execute.executing') : t('plans.execute.confirm')}
          </Button.Base>
          <Button.Base
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            {t('plans.execute.cancel')}
          </Button.Base>
        </div>
      </Dialog.Header>

      <Dialog.Body>
        <Dialog.Description>{t('plans.execute.description')}</Dialog.Description>

        <form.Field name="description">
          {(field) => {
            const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

            return (
              <div>
                <Input.Base
                  id="execute-plan-description"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationError();
                    field.handleChange(event.target.value);
                  }}
                  placeholder={t('plans.execute.fields.description')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
                  maxLength={500}
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
                  id="execute-plan-amount"
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearMutationError();
                    field.handleChange(event.target.value);
                  }}
                  placeholder={t('plans.execute.fields.amount')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
                />
                {fieldError && <Input.Error>{fieldError}</Input.Error>}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="closingDate">
          {(field) => {
            const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

            return (
              <div>
                <Input.Base
                  id="execute-plan-date"
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

        <div className="flex justify-end">
          <Button.Base
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={mutation.isPending}
          >
            {t('plans.execute.reset')}
          </Button.Base>
        </div>

        {mutationError && (
          <Typography.Caption1 className="text-destructive">{mutationError}</Typography.Caption1>
        )}
      </Dialog.Body>
    </form>
  );
};
