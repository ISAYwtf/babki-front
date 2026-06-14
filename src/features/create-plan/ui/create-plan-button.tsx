import { expenseCategoriesQueryOptions } from '@/entities/expense-categories';
import { useCreatePlanMutation } from '@/entities/plans';
import { Dialog as DialogPrimitive, Select as SelectPrimitive } from '@base-ui/react';
import type { StandardSchemaV1Issue } from '@tanstack/react-form';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/shared/lib/shadcn-utils';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { ExpenseCategory } from '@/shared/ui/expense-category';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import i18next from 'i18next';
import {
  LucideCheck,
  LucideChevronDown,
  LucidePlus,
  LucideX,
} from 'lucide-react';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createPlanFormSchema,
  defaultCreatePlanFormValues,
} from '../model/create-plan-form';

interface CreatePlanButtonProps {
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

export const CreatePlanButton: FC<CreatePlanButtonProps> = ({ className }) => {
  const { t } = useTranslation();
  const { data: categoriesData } = useQuery(expenseCategoriesQueryOptions.findAll());
  const categories = categoriesData ?? [];
  const createPlanMutation = useCreatePlanMutation();
  const [open, setOpen] = useState(false);

  const mutationError = getMutationErrorMessage(createPlanMutation.error);

  const form = useForm({
    defaultValues: defaultCreatePlanFormValues,
    validators: { onSubmit: createPlanFormSchema },
    onSubmit: async ({ value, formApi }) => {
      await createPlanMutation.mutateAsync({
        description: value.description.trim(),
        categoryId: value.categoryId,
        amount: Number(value.amount),
        targetDate: value.targetDate,
      });

      setOpen(false);
      formApi.reset();
      createPlanMutation.reset();
    },
  });

  const resetForm = () => {
    form.reset();
    createPlanMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (createPlanMutation.isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const clearMutationError = () => {
    if (createPlanMutation.isError) createPlanMutation.reset();
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
        aria-label={t('plans.create.title')}
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
            <Dialog.Title>{t('plans.create.title')}</Dialog.Title>
            <div className="flex gap-2.5">
              <Button.Base type="submit" disabled={createPlanMutation.isPending}>
                <LucideCheck />
                {createPlanMutation.isPending ? t('plans.create.saving') : t('plans.create.save')}
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
                aria-label={t('plans.create.close')}
                disabled={createPlanMutation.isPending}
              >
                <LucideX className="size-4" />
              </button>
            </div>
          </Dialog.Header>

          <Dialog.Body>
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
                      placeholder={t('plans.create.fields.description')}
                      hasError={Boolean(fieldError)}
                      disabled={createPlanMutation.isPending}
                      maxLength={500}
                    />
                    {fieldError && <Input.Error>{fieldError}</Input.Error>}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="categoryId">
              {(field) => {
                const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));
                const selectedCategory = categories.find((c) => c._id === field.state.value);

                return (
                  <div>
                    <SelectPrimitive.Root
                      value={field.state.value}
                      onValueChange={(value) => {
                        clearMutationError();
                        field.handleChange(value ?? '');
                      }}
                      disabled={createPlanMutation.isPending}
                    >
                      <SelectPrimitive.Trigger
                        onBlur={field.handleBlur}
                        className={cn(
                          `
                            flex h-11 w-full items-center justify-between rounded-lg border bg-background
                            px-3 py-2 text-body-2 transition-colors outline-none
                            focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30
                            disabled:cursor-not-allowed disabled:opacity-50
                          `,
                          fieldError && [
                            'border-destructive',
                            'focus-visible:border-destructive focus-visible:ring-destructive/20',
                          ],
                        )}
                      >
                        {selectedCategory ? (
                          <ExpenseCategory color={selectedCategory.color}>
                            {selectedCategory.name}
                          </ExpenseCategory>
                        ) : (
                          <span className="text-muted-foreground">{t('plans.create.fields.category')}</span>
                        )}
                        <LucideChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      </SelectPrimitive.Trigger>

                      <SelectPrimitive.Portal>
                        <SelectPrimitive.Positioner className="z-50">
                          <SelectPrimitive.Popup
                            className="
                              z-50 max-h-60 min-w-(--anchor-width) overflow-y-auto rounded-lg border
                              bg-popover p-1 shadow-md outline-none
                            "
                          >
                            {categories.map((cat) => (
                              <SelectPrimitive.Item
                                key={cat._id}
                                value={cat._id}
                                className="
                                  flex cursor-default items-center rounded-md px-2 py-1.5 outline-none
                                  hover:bg-muted data-highlighted:bg-muted
                                "
                              >
                                <SelectPrimitive.ItemText>
                                  <ExpenseCategory color={cat.color}>{cat.name}</ExpenseCategory>
                                </SelectPrimitive.ItemText>
                              </SelectPrimitive.Item>
                            ))}
                          </SelectPrimitive.Popup>
                        </SelectPrimitive.Positioner>
                      </SelectPrimitive.Portal>
                    </SelectPrimitive.Root>
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
                      placeholder={t('plans.create.fields.amount')}
                      hasError={Boolean(fieldError)}
                      disabled={createPlanMutation.isPending}
                    />
                    {fieldError && <Input.Error>{fieldError}</Input.Error>}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="targetDate">
              {(field) => {
                const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

                return (
                  <>
                    <Input.Base
                      id="create-plan-date"
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        clearMutationError();
                        field.handleChange(event.target.value);
                      }}
                      hasError={Boolean(fieldError)}
                      disabled={createPlanMutation.isPending}
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
