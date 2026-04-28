import { Dialog as DialogPrimitive } from '@base-ui/react';
import type { StandardSchemaV1Issue } from '@tanstack/react-form';
import { useForm } from '@tanstack/react-form';
import { useCreateDebtMutation } from '@/entities/debts';
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
import {
  createDebtFormSchema,
  defaultCreateDebtFormValues,
  normalizeDueDate,
} from '../model/create-debt-form';

interface CreateDebtButtonProps {
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

export const CreateDebtButton: FC<CreateDebtButtonProps> = ({
  userId,
  className,
}) => {
  const { t } = useTranslation();
  const createDebtMutation = useCreateDebtMutation();
  const [open, setOpen] = useState(false);

  const mutationError = getMutationErrorMessage(createDebtMutation.error);

  const form = useForm({
    defaultValues: defaultCreateDebtFormValues,
    validators: {
      onSubmit: createDebtFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const principalAmount = Number(value.amount);

      await createDebtMutation.mutateAsync({
        userId,
        payload: {
          debtor: value.debtor.trim(),
          principalAmount,
          remainingAmount: principalAmount,
          dueDate: normalizeDueDate(value),
        },
      });

      setOpen(false);
      formApi.reset();
      createDebtMutation.reset();
    },
  });

  const resetForm = () => {
    form.reset();
    createDebtMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (createDebtMutation.isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const clearMutationError = () => {
    if (createDebtMutation.isError) {
      createDebtMutation.reset();
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
        aria-label={t('debts.create.title')}
      >
        <LucidePlus className="size-7" />
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
            <Dialog.Title>{t('debts.create.title')}</Dialog.Title>

            <div className="flex gap-2.5">
              <Button.Base type="submit" disabled={createDebtMutation.isPending}>
                <LucideCheck />
                {createDebtMutation.isPending ? t('debts.create.saving') : t('debts.create.save')}
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
                aria-label={t('debts.create.close')}
                disabled={createDebtMutation.isPending}
              >
                <LucideX className="size-4" />
              </button>
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
                      placeholder={t('debts.create.fields.name')}
                      hasError={Boolean(fieldError)}
                      disabled={createDebtMutation.isPending}
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
                      placeholder={t('debts.create.fields.amount')}
                      hasError={Boolean(fieldError)}
                      disabled={createDebtMutation.isPending}
                    />
                    {fieldError && <Input.Error>{fieldError}</Input.Error>}
                  </div>
                );
              }}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.dateMode}>
              {(dateMode) => (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
                      <form.Field name="dateMode">
                        {(field) => (
                          <>
                            <button
                              type="button"
                              className={cn(
                                `
                                  rounded-md px-3 py-1 text-caption-1 transition-colors
                                  hover:text-foreground
                                `,
                                dateMode === 'day'
                                  ? 'bg-card text-foreground shadow-xs'
                                  : 'text-muted-foreground',
                              )}
                              onClick={() => {
                                clearMutationError();
                                field.handleChange('day');
                              }}
                              disabled={createDebtMutation.isPending}
                            >
                              {t('debts.create.dateModes.day')}
                            </button>
                            <button
                              type="button"
                              className={cn(
                                `
                                  rounded-md px-3 py-1 text-caption-1 transition-colors
                                  hover:text-foreground
                                `,
                                dateMode === 'month'
                                  ? 'bg-card text-foreground shadow-xs'
                                  : 'text-muted-foreground',
                              )}
                              onClick={() => {
                                clearMutationError();
                                field.handleChange('month');
                              }}
                              disabled={createDebtMutation.isPending}
                            >
                              {t('debts.create.dateModes.month')}
                            </button>
                          </>
                        )}
                      </form.Field>
                    </div>
                  </div>

                  <form.Field name={dateMode === 'day' ? 'dayDate' : 'monthDate'}>
                    {(field) => {
                      const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

                      return (
                        <>
                          <Input.Base
                            id="create-debt-date"
                            name={field.name}
                            type={dateMode === 'day' ? 'date' : 'month'}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => {
                              clearMutationError();
                              field.handleChange(event.target.value);
                            }}
                            hasError={Boolean(fieldError)}
                            disabled={createDebtMutation.isPending}
                          />
                          {fieldError && <Input.Error>{fieldError}</Input.Error>}
                          {dateMode === 'month' && (
                            <Typography.Caption1 className="mt-2 text-muted-foreground">
                              {t('debts.create.help.month')}
                            </Typography.Caption1>
                          )}
                        </>
                      );
                    }}
                  </form.Field>
                </div>
              )}
            </form.Subscribe>

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
