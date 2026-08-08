import {
  CategorySelect,
  expenseCategoriesQueryOptions,
} from '@/entities/expense-categories';
import { useCreateExpenseMutation } from '@/entities/expenses';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { Dialog as DialogPrimitive } from '@base-ui/react';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
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
  applyAmountInput,
  calculateExpenseItemsTotal,
  changeExpenseItemQuantity,
  createExpenseCategoryFieldValidators,
  createExpenseFieldSchemas,
  createExpenseFormValidationOptions,
  createExpenseItemDraft,
  getCreateExpenseValidationKey,
  getDefaultCreateExpenseFormValues,
  getExpenseDescriptionValidationError,
  isExpenseItemValid,
  mapCreateExpenseDto,
} from '../model/create-expense-form';
import { ExpenseItemRow } from './expense-item-row';

interface CreateExpenseButtonProps {
  className?: string;
}

const getValidationMessage = (error: string | undefined) => {
  const key = getCreateExpenseValidationKey(error);
  return key ? i18next.t(key) : undefined;
};

export const CreateExpenseButton: FC<CreateExpenseButtonProps> = ({ className }) => {
  const { t } = useTranslation();
  const categoriesQuery = useQuery(expenseCategoriesQueryOptions.findAll());
  const createExpenseMutation = useCreateExpenseMutation();
  const [open, setOpen] = useState(false);
  const [amountOverridden, setAmountOverridden] = useState(false);

  const categories = (categoriesQuery.data ?? []).filter(({ isArchived }) => !isArchived);
  const categoriesUnavailable = categoriesQuery.isLoading || categories.length === 0;

  const clearMutationError = () => {
    if (createExpenseMutation.isError) createExpenseMutation.reset();
  };

  const form = useForm({
    defaultValues: getDefaultCreateExpenseFormValues(),
    ...createExpenseFormValidationOptions,
    listeners: {
      onChange: clearMutationError,
    },
    onSubmit: async ({ value }) => {
      try {
        await createExpenseMutation.mutateAsync(mapCreateExpenseDto(value));
        setOpen(false);
      } catch {
        // The mutation retains the error while all form values stay available for retry.
      }
    },
  });

  const resetState = () => {
    form.reset(getDefaultCreateExpenseFormValues(), { keepDefaultValues: true });
    setAmountOverridden(false);
    createExpenseMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (createExpenseMutation.isPending) return;

    if (nextOpen) resetState();
    setOpen(nextOpen);
  };

  const syncAutomaticAmount = (
    items: ReturnType<typeof form.getFieldValue<'items'>>,
  ) => {
    if (!amountOverridden) {
      form.setFieldValue('amount', calculateExpenseItemsTotal(items));
    }
  };

  const updateItem = (
    index: number,
    field: 'name' | 'quantity' | 'price',
    value: string,
  ) => {
    const items = form.getFieldValue('items');
    const nextItems = items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    form.setFieldValue(`items[${index}].${field}`, value);
    syncAutomaticAmount(nextItems);
  };

  const addItem = () => {
    const nextItems = [...form.getFieldValue('items'), createExpenseItemDraft()];
    form.pushFieldValue('items', nextItems[nextItems.length - 1]);
    syncAutomaticAmount(nextItems);
  };

  const removeItem = (index: number) => {
    const nextItems = form.getFieldValue('items').filter((_, itemIndex) => itemIndex !== index);
    form.removeFieldValue('items', index);
    syncAutomaticAmount(nextItems);
  };

  return (
    <Dialog.Base
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) resetState();
      }}
    >
      <DialogPrimitive.Trigger
        render={(
          <Button.Icon
            type="button"
            className={className}
            aria-label={t('expenses.create.open')}
          />
        )}
      >
        <LucidePlus />
      </DialogPrimitive.Trigger>

      <Dialog.Content className="flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <Dialog.Header className="shrink-0">
            <Dialog.Title>{t('expenses.create.title')}</Dialog.Title>
            <div className="flex gap-2.5">
              <Button.Base
                type="submit"
                disabled={createExpenseMutation.isPending || categoriesUnavailable}
              >
                <LucideCheck />
                {createExpenseMutation.isPending
                  ? t('expenses.create.actions.saving')
                  : t('expenses.create.actions.save')}
              </Button.Base>
              <Button.Icon
                type="button"
                onClick={() => handleOpenChange(false)}
                aria-label={t('expenses.create.close')}
                disabled={createExpenseMutation.isPending}
              >
                <LucideX />
              </Button.Icon>
            </div>
          </Dialog.Header>

          <Dialog.Body className="min-h-0 overflow-y-auto pr-1">
            <form.Field
              name="categoryId"
              validators={createExpenseCategoryFieldValidators}
            >
              {(field) => {
                const error = getValidationMessage(getFirstFieldError(field.state.meta.errors));

                return (
                  <div>
                    <Input.Label>{t('expenses.create.fields.category')}</Input.Label>
                    <CategorySelect
                      options={categories}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      placeholder={t('expenses.create.fields.category')}
                      disabled={createExpenseMutation.isPending || categoriesUnavailable}
                      hasError={Boolean(error)}
                    />
                    {error && <Input.Error>{error}</Input.Error>}
                    {categoriesQuery.isLoading && (
                      <Typography.Caption1 className="mt-2 text-muted-foreground" aria-live="polite">
                        {t('expenses.create.categories.loading')}
                      </Typography.Caption1>
                    )}
                    {categoriesQuery.isError && categoriesQuery.data === undefined && (
                      <div className="mt-2 flex items-center justify-between gap-3" role="alert">
                        <Typography.Caption1 className="text-destructive">
                          {t('expenses.create.categories.error')}
                        </Typography.Caption1>
                        <Button.Base
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => categoriesQuery.refetch()}
                          disabled={categoriesQuery.isFetching || createExpenseMutation.isPending}
                        >
                          {t('expenses.create.categories.retry')}
                        </Button.Base>
                      </div>
                    )}
                    {categoriesQuery.isSuccess && categories.length === 0 && (
                      <Typography.Caption1 className="mt-2 text-muted-foreground">
                        {t('expenses.create.categories.empty')}
                      </Typography.Caption1>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="amount"
                validators={{ onBlur: createExpenseFieldSchemas.amount }}
              >
                {(field) => {
                  const error = getValidationMessage(getFirstFieldError(field.state.meta.errors));

                  return (
                    <div>
                      <Input.Label htmlFor="create-expense-amount">
                        {t('expenses.create.fields.amount')}
                      </Input.Label>
                      <Input.Base
                        id="create-expense-amount"
                        name={field.name}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          clearMutationError();
                          const next = applyAmountInput(
                            event.target.value,
                            form.getFieldValue('items'),
                          );
                          setAmountOverridden(next.amountOverridden);
                          field.handleChange(next.amount);
                        }}
                        placeholder="0.00"
                        hasError={Boolean(error)}
                        disabled={createExpenseMutation.isPending}
                      />
                      {error && <Input.Error>{error}</Input.Error>}
                    </div>
                  );
                }}
              </form.Field>

              <form.Field
                name="transactionDate"
                validators={{ onBlur: createExpenseFieldSchemas.transactionDate }}
              >
                {(field) => {
                  const error = getValidationMessage(getFirstFieldError(field.state.meta.errors));

                  return (
                    <div>
                      <Input.Label htmlFor="create-expense-date">
                        {t('expenses.create.fields.date')}
                      </Input.Label>
                      <Input.Base
                        id="create-expense-date"
                        name={field.name}
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          clearMutationError();
                          field.handleChange(event.target.value);
                        }}
                        hasError={Boolean(error)}
                        disabled={createExpenseMutation.isPending}
                      />
                      {error && <Input.Error>{error}</Input.Error>}
                    </div>
                  );
                }}
              </form.Field>
            </div>

            <form.Field
              name="merchant"
              validators={{ onBlur: createExpenseFieldSchemas.merchant }}
            >
              {(field) => {
                const error = getValidationMessage(getFirstFieldError(field.state.meta.errors));

                return (
                  <div>
                    <Input.Label htmlFor="create-expense-merchant">
                      {t('expenses.create.fields.merchant')}
                    </Input.Label>
                    <Input.Base
                      id="create-expense-merchant"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        clearMutationError();
                        field.handleChange(event.target.value);
                      }}
                      placeholder={t('expenses.create.fields.merchantPlaceholder')}
                      hasError={Boolean(error)}
                      disabled={createExpenseMutation.isPending}
                    />
                    {error && <Input.Error>{error}</Input.Error>}
                  </div>
                );
              }}
            </form.Field>

            <form.Field
              name="description"
              validators={{
                onBlur: ({ value }) => getExpenseDescriptionValidationError(
                  value,
                  form.getFieldValue('items'),
                ),
              }}
            >
              {(field) => {
                const error = getValidationMessage(getFirstFieldError(field.state.meta.errors));

                return (
                  <div>
                    <Input.Label htmlFor="create-expense-description">
                      {t('expenses.create.fields.description')}
                    </Input.Label>
                    <Input.Base
                      id="create-expense-description"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        clearMutationError();
                        field.handleChange(event.target.value);
                      }}
                      placeholder={t('expenses.create.fields.descriptionPlaceholder')}
                      hasError={Boolean(error)}
                      disabled={createExpenseMutation.isPending}
                    />
                    {error && <Input.Error>{error}</Input.Error>}
                  </div>
                );
              }}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.items}>
              {(items) => {
                const lastItem = items.at(-1);
                const addDisabled = createExpenseMutation.isPending
                  || (lastItem !== undefined && !isExpenseItemValid(lastItem));

                return (
                  <div className="flex flex-col gap-3">
                    {items.map((item, index) => (
                      <form.Field
                        key={`${item.id}-name`}
                        name={`items[${index}].name`}
                        validators={{ onBlur: createExpenseFieldSchemas.itemName }}
                      >
                        {(nameField) => (
                          <form.Field
                            name={`items[${index}].quantity`}
                            validators={{ onBlur: createExpenseFieldSchemas.itemQuantity }}
                          >
                            {(quantityField) => (
                              <form.Field
                                name={`items[${index}].price`}
                                validators={{ onBlur: createExpenseFieldSchemas.itemPrice }}
                              >
                                {(priceField) => (
                                  <ExpenseItemRow
                                    item={item}
                                    index={index}
                                    disabled={createExpenseMutation.isPending}
                                    errors={{
                                      name: getValidationMessage(
                                        getFirstFieldError(nameField.state.meta.errors),
                                      ),
                                      quantity: getValidationMessage(
                                        getFirstFieldError(quantityField.state.meta.errors),
                                      ),
                                      price: getValidationMessage(
                                        getFirstFieldError(priceField.state.meta.errors),
                                      ),
                                    }}
                                    onNameChange={(value) => updateItem(index, 'name', value)}
                                    onNameBlur={nameField.handleBlur}
                                    onQuantityChange={(value) => updateItem(index, 'quantity', value)}
                                    onQuantityBlur={quantityField.handleBlur}
                                    onPriceChange={(value) => updateItem(index, 'price', value)}
                                    onPriceBlur={priceField.handleBlur}
                                    onIncrement={() => updateItem(
                                      index,
                                      'quantity',
                                      changeExpenseItemQuantity(item.quantity, 1),
                                    )}
                                    onDecrement={() => updateItem(
                                      index,
                                      'quantity',
                                      changeExpenseItemQuantity(item.quantity, -1),
                                    )}
                                    onRemove={() => removeItem(index)}
                                  />
                                )}
                              </form.Field>
                            )}
                          </form.Field>
                        )}
                      </form.Field>
                    ))}

                    <Button.Base
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addItem}
                      disabled={addDisabled}
                    >
                      <LucidePlus />
                      {items.length === 0
                        ? t('expenses.create.items.start')
                        : t('expenses.create.items.addMore')}
                    </Button.Base>
                  </div>
                );
              }}
            </form.Subscribe>

            {createExpenseMutation.isError && (
              <Typography.Caption1 className="text-destructive" role="alert">
                {t('expenses.create.errors.submit')}
              </Typography.Caption1>
            )}
          </Dialog.Body>
        </form>
      </Dialog.Content>
    </Dialog.Base>
  );
};
