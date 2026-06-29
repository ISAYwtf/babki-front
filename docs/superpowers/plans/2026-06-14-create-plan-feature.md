# Create Plan Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "create plan" button to the Plans widget that opens a modal form with Description, Category (dropdown with color pills), Amount, and Date fields, posting to `POST /plans` and invalidating the plans list on success.

**Architecture:** Follows the established `create-save` / `create-income` pattern — a feature component owns the dialog, form state (TanStack Form + Zod), and mutation call; the plans entity exposes the `useCreatePlanMutation` hook; the widget replaces its plain `LucidePlus` button with the new `<CreatePlanButton />`. The category dropdown uses base-ui's `Select` (already installed via `@base-ui/react`) and renders each option with the shared `ExpenseCategory` component.

**Tech Stack:** React, TanStack Form, TanStack Query, Zod, `@base-ui/react` (Select + Dialog), `i18next`, Tailwind CSS v4

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/shared/lib/i18n/ru/main.json` |
| Modify | `src/entities/plans/model/schemas.ts` |
| Modify | `src/entities/plans/api/plans.api.ts` |
| Modify | `src/entities/plans/api/plans.query.ts` |
| Modify | `src/entities/plans/index.ts` |
| Create | `src/features/create-plan/model/create-plan-form.ts` |
| Create | `src/features/create-plan/ui/create-plan-button.tsx` |
| Create | `src/features/create-plan/index.ts` |
| Modify | `src/widgets/plans/plans.tsx` |

---

### Task 1: Add i18n keys

**Files:**
- Modify: `src/shared/lib/i18n/ru/main.json`

- [ ] **Step 1: Add `plans.create` section to the JSON**

Open `src/shared/lib/i18n/ru/main.json` and add a top-level `"plans"` key alongside the existing `"incomes"` key:

```json
"plans": {
  "create": {
    "title": "Новый план",
    "save": "Сохранить",
    "saving": "Сохранение...",
    "close": "Закрыть окно",
    "fields": {
      "description": "Описание",
      "category": "Категория",
      "amount": "00.00",
      "date": "Дата"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/lib/i18n/ru/main.json
git commit -m "feat: add i18n keys for create-plan"
```

---

### Task 2: Extend the plans entity

**Files:**
- Modify: `src/entities/plans/model/schemas.ts`
- Modify: `src/entities/plans/api/plans.api.ts`
- Modify: `src/entities/plans/api/plans.query.ts`
- Modify: `src/entities/plans/index.ts`

- [ ] **Step 1: Add `createPlanPayloadSchema` and its type to `schemas.ts`**

Append to the bottom of `src/entities/plans/model/schemas.ts` (after the existing exports):

```ts
export const createPlanPayloadSchema = z.object({
  description: z.string().max(500),
  targetDate: dateStringSchema,
  amount: z.number().min(0.01),
  categoryId: objectIdSchema,
});

export type CreatePlanPayload = z.infer<typeof createPlanPayloadSchema>;
```

- [ ] **Step 2: Add `create` method to `PlansApi`**

Replace the entire `src/entities/plans/api/plans.api.ts` with:

```ts
import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type CreatePlanPayload,
  type ListPlansQuery,
  listPlansQuerySchema,
  type Plan,
  planSchema,
  type PlansPaginatedResponse,
  plansPaginatedResponseSchema,
} from '../model/schemas';

class PlansApi {
  private readonly client = apiClient;

  findAll = async (query: ListPlansQuery = {}) => {
    const params = listPlansQuerySchema.parse(query);
    const response = await this.client.get<PlansPaginatedResponse>('/plans', { params });

    return parseWithSchema(plansPaginatedResponseSchema, response.data);
  };

  create = async (payload: CreatePlanPayload) => {
    const response = await this.client.post<Plan>('/plans', payload);

    return parseWithSchema(planSchema, response.data);
  };
}

export const plansApi = new PlansApi();
```

- [ ] **Step 3: Add `useCreatePlanMutation` to `plans.query.ts`**

Replace the entire `src/entities/plans/api/plans.query.ts` with:

```ts
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from './plans.api';
import type { CreatePlanPayload, ListPlansQuery } from '../model/schemas';

export const plansQueryKeys = {
  all: ['plans'] as const,
  listAll: () => [...plansQueryKeys.all, 'list'] as const,
  list: (query: ListPlansQuery) => [...plansQueryKeys.listAll(), query] as const,
};

export const plansQueryOptions = {
  findAll: (query: ListPlansQuery = {}) => queryOptions({
    queryKey: plansQueryKeys.list(query),
    queryFn: () => plansApi.findAll(query),
  }),
};

export const useCreatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => plansApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() });
    },
  });
};
```

- [ ] **Step 4: Export the new mutation hook from `index.ts`**

`src/entities/plans/index.ts` already re-exports everything from `./api/plans.query` via `export * from './api/plans.query'`, so `useCreatePlanMutation` is automatically exported. Verify the file looks like:

```ts
export * from './model/schemas';
export * from './api/plans.query';
```

No change needed if it already matches.

- [ ] **Step 5: Commit**

```bash
git add src/entities/plans/model/schemas.ts src/entities/plans/api/plans.api.ts src/entities/plans/api/plans.query.ts src/entities/plans/index.ts
git commit -m "feat: add create plan API method and mutation hook"
```

---

### Task 3: Create the form schema

**Files:**
- Create: `src/features/create-plan/model/create-plan-form.ts`

- [ ] **Step 1: Write the Zod form schema**

Create `src/features/create-plan/model/create-plan-form.ts`:

```ts
import { z } from 'zod';

export const createPlanFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'required')
    .max(500, 'tooLong'),
  categoryId: z.string().trim().min(1, 'required'),
  amount: z
    .string()
    .trim()
    .min(1, 'required')
    .refine((value) => !Number.isNaN(Number(value)), 'invalid')
    .refine((value) => Number(value) >= 0.01, 'min'),
  targetDate: z.string().trim().min(1, 'required'),
});

export type CreatePlanFormValues = z.infer<typeof createPlanFormSchema>;

export const defaultCreatePlanFormValues: CreatePlanFormValues = {
  description: '',
  categoryId: '',
  amount: '',
  targetDate: '',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/create-plan/model/create-plan-form.ts
git commit -m "feat: add create-plan form schema"
```

---

### Task 4: Create the dialog UI component

**Files:**
- Create: `src/features/create-plan/ui/create-plan-button.tsx`
- Create: `src/features/create-plan/index.ts`

The category dropdown uses `Select` from `@base-ui/react`. The trigger renders the selected `ExpenseCategory` component by looking up the selected category from the loaded list. Each dropdown item also renders an `ExpenseCategory` component via `Select.ItemText`.

- [ ] **Step 1: Create `create-plan-button.tsx`**

Create `src/features/create-plan/ui/create-plan-button.tsx`:

```tsx
import { expenseCategoriesQueryOptions } from '@/entities/expense-categories';
import { useCreatePlanMutation } from '@/entities/plans';
import { ExpenseCategory } from '@/shared/ui/expense-category/expense-category';
import { Dialog as DialogPrimitive, Select as SelectPrimitive } from '@base-ui/react';
import type { StandardSchemaV1Issue } from '@tanstack/react-form';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/shared/lib/shadcn-utils';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
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
            {/* Description */}
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

            {/* Category */}
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
                          fieldError && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
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
                        <SelectPrimitive.Positioner>
                          <SelectPrimitive.Popup
                            className="
                              z-50 max-h-60 min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border
                              bg-popover p-1 shadow-md outline-none
                            "
                          >
                            {categories.map((cat) => (
                              <SelectPrimitive.Item
                                key={cat._id}
                                value={cat._id}
                                className="
                                  flex cursor-default items-center rounded-md px-2 py-1.5 outline-none
                                  hover:bg-muted data-[highlighted]:bg-muted
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

            {/* Amount */}
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

            {/* Date */}
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
```

- [ ] **Step 2: Create `src/features/create-plan/index.ts`**

```ts
export { CreatePlanButton } from './ui/create-plan-button';
```

- [ ] **Step 3: Commit**

```bash
git add src/features/create-plan/
git commit -m "feat: add create-plan dialog component"
```

---

### Task 5: Wire up in the Plans widget

**Files:**
- Modify: `src/widgets/plans/plans.tsx`

- [ ] **Step 1: Replace the plain `LucidePlus` button with `<CreatePlanButton />`**

Replace the entire `src/widgets/plans/plans.tsx` with:

```tsx
import { plansQueryOptions } from '@/entities/plans';
import { CreatePlanButton } from '@/features/create-plan';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Table } from '@/shared/ui/table';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { LucidePencil } from 'lucide-react';
import { type FC } from 'react';

const locale = i18next.language;

const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

const formatDate = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const Plans: FC = () => {
  const { data, isLoading } = useQuery(
    plansQueryOptions.findAll({ status: 'active', limit: 100 }),
  );

  return (
    <Card.Base>
      <Card.Header>
        <Card.Title>Планирование</Card.Title>
        <Card.Controls>
          <Button.Icon><LucidePencil className="size-5" /></Button.Icon>
          <CreatePlanButton />
        </Card.Controls>
      </Card.Header>
      <Card.Content className="px-0">
        {isLoading && <div className="px-5 py-3 text-muted-foreground">Загрузка...</div>}
        {!isLoading && !data?.items.length && (
          <div className="px-5 py-3 text-muted-foreground">Нет активных планов</div>
        )}
        {!isLoading && !!data?.items.length && (
          <Table.Base>
            <Table.Body>
              {data.items.map((plan) => (
                <Table.Row key={plan._id}>
                  <Table.Cell>{plan.description}</Table.Cell>
                  <Table.Cell className="text-muted-foreground text-body-2">
                    {formatDate.format(new Date(plan.targetDate))}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {formatAmount.format(plan.amount)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Base>
        )}
      </Card.Content>
    </Card.Base>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/plans/plans.tsx
git commit -m "feat: wire CreatePlanButton into Plans widget"
```

---

## Verification

1. Run `npm run dev` and open the app
2. Navigate to the dashboard and find the Planning (Планирование) widget
3. Click the `+` button — the modal should open with the title "Новый план"
4. Verify the Category dropdown shows colored pills using `ExpenseCategory` for each option
5. Submit with empty fields — validation errors should appear under each field
6. Fill in all fields and submit — the plan should be created, the modal should close, and the new plan should appear in the list
7. Run `npm run lint` — should pass with no errors
8. Run `npm run build` — TypeScript should compile cleanly
