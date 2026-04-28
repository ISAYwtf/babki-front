import { useCreateIncomeMutation } from '@/entities/incomes/api/incomes.query';
import { Dialog as DialogPrimitive } from '@base-ui/react';
import type { StandardSchemaV1Issue } from '@tanstack/react-form';
import { useForm } from '@tanstack/react-form';
import { cn } from '@/shared/lib/shadcn-utils';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import i18next from 'i18next';
import {
  LucideCheck,
  LucidePlus,
  LucideX,
} from 'lucide-react';
import {
  type FC,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { createIncomeFormSchema, defaultCreateIncomeFormValues } from '../model/create-income-form';

interface CreateIncomeButtonProps {
  userId: string;
  className?: string;
}

const mapErrorMessage = (code: string | undefined) => {
  switch (code) {
    case 'required':
      return i18next.t('validation.required');
    case 'invalid':
      return i18next.t('validation.amountInvalid');
    case 'min':
      return i18next.t('validation.amountMin');
    case 'tooLong':
      return i18next.t('validation.nameTooLong');
    default:
      return undefined;
  }
};

const isStandardSchemaV1Issue = (error: unknown): error is StandardSchemaV1Issue => (
  !!error
  && typeof error === 'object'
  && 'message' in error
);

const getMutationErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return undefined;
};

const getFirstFieldError = (errors: unknown[]) => {
  const firstError = errors[0];

  if (typeof firstError === 'string') {
    return firstError;
  }

  if (isStandardSchemaV1Issue(firstError)) {
    return String(firstError.message);
  }

  return undefined;
};

export const CreateIncomeButton: FC<CreateIncomeButtonProps> = ({
  userId,
  className,
}) => {
  const { t } = useTranslation();
  const createIncomeMutation = useCreateIncomeMutation();
  const [open, setOpen] = useState(false);

  const mutationError = getMutationErrorMessage(createIncomeMutation.error);

  const form = useForm({
    defaultValues: defaultCreateIncomeFormValues,
    validators: {
      onSubmit: createIncomeFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createIncomeMutation.mutateAsync({
        userId,
        payload: {
          source: value.source.trim(),
          amount: Number(value.amount),
          incomeDate: value.incomeDate,
        },
      });

      setOpen(false);
      formApi.reset();
      createIncomeMutation.reset();
    },
  });

  const resetForm = () => {
    form.reset();
    createIncomeMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (createIncomeMutation.isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const clearMutationError = () => {
    if (createIncomeMutation.isError) {
      createIncomeMutation.reset();
    }
  };

  return (
    <Dialog.Base open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Trigger
        className={cn(
          `
            group/button inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)]
            transition-colors hover:bg-muted
          `,
          className,
        )}
        aria-label={t('incomes.create.title')}
      >
        <LucidePlus className="size-5" />
      </DialogPrimitive.Trigger>

      <Dialog.Content>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <Dialog.Header>
            <Dialog.Title>{t('incomes.create.title')}</Dialog.Title>

            <div className="flex gap-2.5">
              <Button.Base type="submit" disabled={createIncomeMutation.isPending}>
                <LucideCheck />
                {createIncomeMutation.isPending ? t('incomes.create.saving') : t('incomes.create.save')}
              </Button.Base>
              <button
                type="button"
                className={cn(
                  `
                  inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground
                  transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50
                `,
                )}
                onClick={() => handleOpenChange(false)}
                aria-label={t('incomes.create.close')}
                disabled={createIncomeMutation.isPending}
              >
                <LucideX className="size-4" />
              </button>
            </div>
          </Dialog.Header>

          <Dialog.Body>
            <form.Field name="source">
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
                      placeholder={t('incomes.create.fields.name')}
                      hasError={Boolean(fieldError)}
                      disabled={createIncomeMutation.isPending}
                      maxLength={150}
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
                      id={field.name}
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
                      placeholder={t('incomes.create.fields.amount')}
                      hasError={Boolean(fieldError)}
                      disabled={createIncomeMutation.isPending}
                    />
                    {fieldError && <Input.Error>{fieldError}</Input.Error>}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="incomeDate">
              {(field) => {
                const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

                return (
                  <>
                    <Input.Base
                      id="create-income-date"
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        clearMutationError();
                        field.handleChange(event.target.value);
                      }}
                      hasError={Boolean(fieldError)}
                      disabled={createIncomeMutation.isPending}
                    />
                    {fieldError && <Input.Error>{fieldError}</Input.Error>}
                  </>
                );
              }}
            </form.Field>

            {mutationError && (
              <Typography.Caption1 className="text-destructive">
                {mutationError}
              </Typography.Caption1>
            )}
          </Dialog.Body>
        </form>
      </Dialog.Content>
    </Dialog.Base>
  );
};
