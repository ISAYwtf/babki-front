# Plan Details Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modal that opens when a Plans table row is clicked, showing plan details with Edit / Delete / Execute actions.

**Architecture:** A single `manage-plan` feature hosts a controlled `PlanDetailsDialog` (view/edit/execute mode state machine plus a nested delete-confirm dialog). The plans widget owns the `selectedPlan` state and renders one dialog. The plans entity gains `update` / `remove` / `close` API methods and mutation hooks. The row already carries the full `Plan` from `findAll`, so no `findOne` is added.

**Tech Stack:** React 19, TypeScript, TanStack Query, TanStack React Form, Zod, `@base-ui/react` (Dialog, Select), Tailwind CSS v4, i18next.

## Global Constraints

- FSD import direction only: `widgets → features → entities → shared`. Never import upward. Features export only UI from `index.ts`; entities export only from `index.ts`.
- Entity API class pattern: validate payload with `*.parse(payload)` first, then `parseWithSchema(schema, response.data)` on the response. `parseWithSchema` may return `null`.
- `apiClient` is an axios instance (`.get/.post/.patch/.delete`).
- Currency code via `getCurrentCurrencyCode()` from `@/shared/lib/currency`; locale via `i18next.language`.
- Form values are strings; numeric prefill uses `String(plan.amount)`.
- `<input type="date">` requires `yyyy-MM-dd`. Backend dates are full ISO strings; prefill via `new Date(value).toISOString().slice(0, 10)` (UTC slice avoids timezone day-shift). Submit the raw `yyyy-MM-dd` value back.
- `close` (POST `/plans/:id/close`) creates a real expense server-side; its mutation must invalidate `plansQueryKeys.listAll()`, `['expenses']`, and `['reports']`.
- `update` / `close` mutation hooks take `{ planId, payload }`; `remove` takes the `planId` string.
- No test runner is configured. Per-task verification is `npm run lint` + `npx tsc -b` (type check). The final task adds a manual `npm run dev` smoke check.
- Reuse existing `validation.*` i18n keys: `required`, `amountInvalid`, `amountMin`, `nameTooLong`, `descriptionTooLong`.
- Class merge utility: `cn()` from `@/shared/lib/shadcn-utils`. Path alias `@` → `src/`.

---

### Task 1: Entity layer — schemas, API methods, mutation hooks

**Files:**
- Modify: `src/entities/plans/model/schemas.ts`
- Modify: `src/entities/plans/api/plans.api.ts`
- Modify: `src/entities/plans/api/plans.query.ts`

**Interfaces:**
- Consumes: existing `planSchema`, `Plan`, `plansApi`, `plansQueryKeys`, `apiClient`, `parseWithSchema`.
- Produces:
  - `updatePlanPayloadSchema`, `UpdatePlanPayload`, `closePlanPayloadSchema`, `ClosePlanPayload` (from `@/entities/plans`).
  - `plansApi.update(planId: string, payload: UpdatePlanPayload): Promise<Plan | null>`
  - `plansApi.remove(planId: string): Promise<void>`
  - `plansApi.close(planId: string, payload: ClosePlanPayload): Promise<Plan | null>`
  - `useUpdatePlanMutation()` — `mutateAsync({ planId, payload }) => Plan | null`
  - `useRemovePlanMutation()` — `mutateAsync(planId: string) => void`
  - `useClosePlanMutation()` — `mutateAsync({ planId, payload }) => Plan | null`

- [ ] **Step 1: Add payload schemas to `model/schemas.ts`**

Append to the end of `src/entities/plans/model/schemas.ts`:

```ts
export const updatePlanPayloadSchema = z.object({
  description: z.string().max(500).optional(),
  targetDate: dateStringSchema.optional(),
  amount: z.number().min(0.01).optional(),
  categoryId: objectIdSchema.optional(),
});

export type UpdatePlanPayload = z.infer<typeof updatePlanPayloadSchema>;

export const closePlanPayloadSchema = z.object({
  closingDate: dateStringSchema.optional(),
  amount: z.number().min(0.01).optional(),
  description: z.string().max(500).optional(),
});

export type ClosePlanPayload = z.infer<typeof closePlanPayloadSchema>;
```

(`dateStringSchema` and `objectIdSchema` are already imported at the top of the file.)

- [ ] **Step 2: Add `update` / `remove` / `close` to `plans.api.ts`**

In `src/entities/plans/api/plans.api.ts`, extend the imports from `../model/schemas` to also include `closePlanPayloadSchema`, `type ClosePlanPayload`, `updatePlanPayloadSchema`, `type UpdatePlanPayload`. Then add these three methods inside the `PlansApi` class, after `create`:

```ts
  update = async (planId: string, payload: UpdatePlanPayload) => {
    const body = updatePlanPayloadSchema.parse(payload);
    const response = await this.client.patch<Plan>(`/plans/${planId}`, body);

    return parseWithSchema(planSchema, response.data);
  };

  remove = async (planId: string) => {
    await this.client.delete(`/plans/${planId}`);
  };

  close = async (planId: string, payload: ClosePlanPayload) => {
    const body = closePlanPayloadSchema.parse(payload);
    const response = await this.client.post<Plan>(`/plans/${planId}/close`, body);

    return parseWithSchema(planSchema, response.data);
  };
```

- [ ] **Step 3: Add mutation hooks to `plans.query.ts`**

In `src/entities/plans/api/plans.query.ts`, extend the type-only import to add `UpdatePlanPayload` and `ClosePlanPayload`:

```ts
import type { ClosePlanPayload, ListPlansQuery, UpdatePlanPayload } from '../model/schemas';
```

Then append these hooks after `useCreatePlanMutation`:

```ts
export const useUpdatePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ planId, payload }: { planId: string; payload: UpdatePlanPayload }) => (
        plansApi.update(planId, payload)
      ),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() });
      },
    }),
  );
};

export const useRemovePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: plansApi.remove,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() });
      },
    }),
  );
};

export const useClosePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: ({ planId, payload }: { planId: string; payload: ClosePlanPayload }) => (
        plansApi.close(planId, payload)
      ),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: plansQueryKeys.listAll() }),
          queryClient.invalidateQueries({ queryKey: ['expenses'] }),
          queryClient.invalidateQueries({ queryKey: ['reports'] }),
        ]);
      },
    }),
  );
};
```

- [ ] **Step 4: Verify lint + types**

Run: `npm run lint && npx tsc -b`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/entities/plans
git commit -m "feat: add update/remove/close to plans entity"
```

---

### Task 2: i18n keys for the details modal

**Files:**
- Modify: `src/shared/lib/i18n/ru/main.json`

**Interfaces:**
- Produces: typed `plans.details.*`, `plans.edit.*`, `plans.delete.*`, `plans.execute.*` keys (auto-typed via `resources['ru']` in `src/shared/types/i18n.d.ts`).

- [ ] **Step 1: Extend the `plans` object**

In `src/shared/lib/i18n/ru/main.json`, the `plans` object currently contains only `create`. Add these four sibling keys inside `plans` (keep the existing `create` entry):

```json
    "details": {
      "title": "План",
      "close": "Закрыть окно",
      "fields": {
        "description": "Описание",
        "category": "Категория",
        "amount": "Сумма",
        "targetDate": "Дата"
      },
      "actions": {
        "edit": "Редактировать",
        "delete": "Удалить",
        "execute": "Выполнить"
      }
    },
    "edit": {
      "title": "Редактирование плана",
      "save": "Сохранить",
      "saving": "Сохранение...",
      "cancel": "Отмена",
      "close": "Закрыть окно",
      "fields": {
        "description": "Описание",
        "category": "Категория",
        "amount": "00.00"
      }
    },
    "delete": {
      "title": "Удалить план?",
      "description": "Это действие нельзя отменить.",
      "confirm": "Удалить",
      "deleting": "Удаление...",
      "cancel": "Отмена"
    },
    "execute": {
      "title": "Выполнить план",
      "description": "Будет создан расход, план будет закрыт.",
      "confirm": "Выполнить",
      "executing": "Выполнение...",
      "cancel": "Отмена",
      "reset": "Сбросить",
      "close": "Закрыть окно",
      "fields": {
        "closingDate": "Дата",
        "amount": "00.00",
        "description": "Описание"
      }
    }
```

- [ ] **Step 2: Verify JSON is valid + types build**

Run: `npx tsc -b`
Expected: no errors (this also regenerates i18n key types).

- [ ] **Step 3: Commit**

```bash
git add src/shared/lib/i18n/ru/main.json
git commit -m "feat: add i18n keys for plan details modal"
```

---

### Task 3: Feature model — error helpers and form schemas

**Files:**
- Create: `src/features/manage-plan/model/errors.ts`
- Create: `src/features/manage-plan/model/edit-plan-form.ts`
- Create: `src/features/manage-plan/model/execute-plan-form.ts`

**Interfaces:**
- Consumes: `Plan` from `@/entities/plans`.
- Produces:
  - `errors.ts`: `mapErrorMessage(code?: string): string | undefined`, `getFirstFieldError(errors: unknown[]): string | undefined`, `getMutationErrorMessage(error: unknown): string | undefined`.
  - `edit-plan-form.ts`: `editPlanFormSchema`, `type EditPlanFormValues`, `getEditPlanFormValues(plan: Plan): EditPlanFormValues`.
  - `execute-plan-form.ts`: `executePlanFormSchema`, `type ExecutePlanFormValues`, `getExecutePlanFormValues(plan: Plan): ExecutePlanFormValues`, `todayDateInputValue(): string`.

- [ ] **Step 1: Create `model/errors.ts`**

```ts
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
```

- [ ] **Step 2: Create `model/edit-plan-form.ts`**

```ts
import { z } from 'zod';
import type { Plan } from '@/entities/plans';

export const editPlanFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'required')
    .max(500, 'descriptionTooLong'),
  categoryId: z.string().trim().min(1, 'required'),
  amount: z
    .string()
    .trim()
    .min(1, 'required')
    .refine((value) => !Number.isNaN(Number(value)), 'invalid')
    .refine((value) => Number(value) >= 0.01, 'min'),
  targetDate: z.string().trim().min(1, 'required'),
});

export type EditPlanFormValues = z.infer<typeof editPlanFormSchema>;

const toDateInputValue = (value: string) => new Date(value).toISOString().slice(0, 10);

export const getEditPlanFormValues = (plan: Plan): EditPlanFormValues => ({
  description: plan.description,
  categoryId: plan.categoryId,
  amount: String(plan.amount),
  targetDate: toDateInputValue(plan.targetDate),
});
```

- [ ] **Step 3: Create `model/execute-plan-form.ts`**

```ts
import { z } from 'zod';
import type { Plan } from '@/entities/plans';

export const executePlanFormSchema = z.object({
  closingDate: z.string().trim().min(1, 'required'),
  amount: z
    .string()
    .trim()
    .min(1, 'required')
    .refine((value) => !Number.isNaN(Number(value)), 'invalid')
    .refine((value) => Number(value) >= 0.01, 'min'),
  description: z
    .string()
    .trim()
    .min(1, 'required')
    .max(500, 'descriptionTooLong'),
});

export type ExecutePlanFormValues = z.infer<typeof executePlanFormSchema>;

export const todayDateInputValue = () => new Date().toISOString().slice(0, 10);

export const getExecutePlanFormValues = (plan: Plan): ExecutePlanFormValues => ({
  closingDate: todayDateInputValue(),
  amount: String(plan.amount),
  description: plan.description,
});
```

- [ ] **Step 4: Verify lint + types**

Run: `npm run lint && npx tsc -b`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/manage-plan/model
git commit -m "feat: add manage-plan form schemas and error helpers"
```

---

### Task 4: Shared CategorySelect component + create-plan refactor

**Files:**
- Create: `src/shared/ui/category-select/category-select.tsx`
- Create: `src/shared/ui/category-select/index.ts`
- Modify: `src/features/create-plan/ui/create-plan-button.tsx`

**Interfaces:**
- Consumes: `ExpenseCategory` from `@/shared/ui/expense-category`; `cn` from `@/shared/lib/shadcn-utils`.
- Produces:
  - `CategorySelect` — props `{ options: CategorySelectOption[]; value: string; onValueChange: (value: string) => void; onBlur?: () => void; placeholder: string; disabled?: boolean; hasError?: boolean }` (from `@/shared/ui/category-select`).
  - `type CategorySelectOption = { _id: string; name: string; color?: string }`.

**Rationale:** This presentational dropdown is reused by the create-plan form and the new edit form. It lives in `shared/` and therefore must NOT import from `entities/` — it receives `options` as a prop; consumers fetch categories via `expenseCategoriesQueryOptions` and pass them in. The minimal `CategorySelectOption` interface is satisfied structurally by the entity's category objects.

- [ ] **Step 1: Create `src/shared/ui/category-select/category-select.tsx`**

```tsx
import { Select as SelectPrimitive } from '@base-ui/react';
import { cn } from '@/shared/lib/shadcn-utils';
import { ExpenseCategory } from '@/shared/ui/expense-category';
import { LucideChevronDown } from 'lucide-react';
import type { FC } from 'react';

export interface CategorySelectOption {
  _id: string;
  name: string;
  color?: string;
}

interface CategorySelectProps {
  options: CategorySelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

export const CategorySelect: FC<CategorySelectProps> = ({
  options,
  value,
  onValueChange,
  onBlur,
  placeholder,
  disabled,
  hasError,
}) => {
  const selected = options.find((option) => option._id === value);

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next ?? '')}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        onBlur={onBlur}
        className={cn(
          `
            flex h-11 w-full items-center justify-between rounded-lg border bg-background
            px-3 py-2 text-body-2 transition-colors outline-none
            focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30
            disabled:cursor-not-allowed disabled:opacity-50
          `,
          hasError && [
            'border-destructive',
            'focus-visible:border-destructive focus-visible:ring-destructive/20',
          ],
        )}
      >
        {selected ? (
          <ExpenseCategory color={selected.color}>{selected.name}</ExpenseCategory>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
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
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option._id}
                value={option._id}
                className="
                  flex cursor-default items-center rounded-md px-2 py-1.5 outline-none
                  hover:bg-muted data-highlighted:bg-muted
                "
              >
                <SelectPrimitive.ItemText>
                  <ExpenseCategory color={option.color}>{option.name}</ExpenseCategory>
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
```

- [ ] **Step 2: Create `src/shared/ui/category-select/index.ts`**

```ts
export { CategorySelect } from './category-select';
export type { CategorySelectOption } from './category-select';
```

- [ ] **Step 3: Refactor `create-plan-button.tsx` to use `CategorySelect`**

In `src/features/create-plan/ui/create-plan-button.tsx`:

(a) Update imports — change the `@base-ui/react` import to drop `Select` (keep `Dialog`), remove the now-unused `ExpenseCategory` and `LucideChevronDown` imports, and add the `CategorySelect` import. The relevant import lines become:

```tsx
import { Dialog as DialogPrimitive } from '@base-ui/react';
```

```tsx
import { CategorySelect } from '@/shared/ui/category-select';
```

Remove these now-unused import lines:

```tsx
import { ExpenseCategory } from '@/shared/ui/expense-category';
```

and the `LucideChevronDown` entry from the `lucide-react` import (keep `LucideCheck`, `LucidePlus`, `LucideX`). The `cn` import stays — it is still used by the `DialogPrimitive.Trigger`.

(b) Replace the entire `categoryId` field render (the `<form.Field name="categoryId">` block, from `{(field) => {` through its closing `}}`) with:

```tsx
              {(field) => {
                const fieldError = mapErrorMessage(getFirstFieldError(field.state.meta.errors));

                return (
                  <div>
                    <CategorySelect
                      options={categories}
                      value={field.state.value}
                      onValueChange={(value) => {
                        clearMutationError();
                        field.handleChange(value);
                      }}
                      onBlur={field.handleBlur}
                      placeholder={t('plans.create.fields.category')}
                      disabled={createPlanMutation.isPending}
                      hasError={Boolean(fieldError)}
                    />
                    {fieldError && <Input.Error>{fieldError}</Input.Error>}
                  </div>
                );
              }}
```

- [ ] **Step 4: Verify lint + types + create-plan still builds**

Run: `npm run lint && npx tsc -b`
Expected: no errors. Confirm `create-plan-button.tsx` has no unused-import lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/category-select src/features/create-plan/ui/create-plan-button.tsx
git commit -m "feat: extract shared CategorySelect, use it in create-plan"
```

---

### Task 5: Shared close button, plan view, delete-confirm dialog

**Files:**
- Create: `src/features/manage-plan/ui/modal-close-button.tsx`
- Create: `src/features/manage-plan/ui/plan-view.tsx`
- Create: `src/features/manage-plan/ui/delete-confirm-dialog.tsx`

**Interfaces:**
- Consumes: `Plan` and `useRemovePlanMutation` from `@/entities/plans`; `expenseCategoriesQueryOptions` from `@/entities/expense-categories`; `getMutationErrorMessage` from `../model/errors`.
- Produces:
  - `ModalCloseButton` — props `{ onClick: () => void; disabled?: boolean; label: string }`.
  - `PlanView` — props `{ plan: Plan; onEdit: () => void; onDelete: () => void; onExecute: () => void; onClose: () => void }`.
  - `DeleteConfirmDialog` — props `{ open: boolean; planId: string; mutation: ReturnType<typeof useRemovePlanMutation>; onCancel: () => void; onConfirmed: () => void }`.

- [ ] **Step 1: Create `ui/modal-close-button.tsx`**

```tsx
import { cn } from '@/shared/lib/shadcn-utils';
import { LucideX } from 'lucide-react';
import type { FC } from 'react';

interface ModalCloseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export const ModalCloseButton: FC<ModalCloseButtonProps> = ({ onClick, disabled, label }) => (
  <button
    type="button"
    className={cn(
      `
        inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground
        transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50
      `,
    )}
    onClick={onClick}
    aria-label={label}
    disabled={disabled}
  >
    <LucideX className="size-4" />
  </button>
);
```

- [ ] **Step 2: Create `ui/plan-view.tsx`**

```tsx
import { type Plan } from '@/entities/plans';
import { expenseCategoriesQueryOptions } from '@/entities/expense-categories';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { ExpenseCategory } from '@/shared/ui/expense-category';
import { Typography } from '@/shared/ui/typography';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { LucideCheck, LucidePencil, LucideTrash2 } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalCloseButton } from './modal-close-button';

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

interface PlanViewProps {
  plan: Plan;
  onEdit: () => void;
  onDelete: () => void;
  onExecute: () => void;
  onClose: () => void;
}

export const PlanView: FC<PlanViewProps> = ({
  plan,
  onEdit,
  onDelete,
  onExecute,
  onClose,
}) => {
  const { t } = useTranslation();
  const { data: categoriesData } = useQuery(expenseCategoriesQueryOptions.findAll());
  const category = (categoriesData ?? []).find((c) => c._id === plan.categoryId);

  return (
    <div>
      <Dialog.Header>
        <Dialog.Title>{t('plans.details.title')}</Dialog.Title>
        <ModalCloseButton onClick={onClose} label={t('plans.details.close')} />
      </Dialog.Header>

      <Dialog.Body>
        <div className="flex flex-col gap-1">
          <Typography.Caption1 className="text-muted-foreground">
            {t('plans.details.fields.description')}
          </Typography.Caption1>
          <Typography.Body2>{plan.description}</Typography.Body2>
        </div>

        <div className="flex flex-col gap-1">
          <Typography.Caption1 className="text-muted-foreground">
            {t('plans.details.fields.category')}
          </Typography.Caption1>
          {category ? (
            <ExpenseCategory color={category.color}>{category.name}</ExpenseCategory>
          ) : (
            <Typography.Body2 className="text-muted-foreground">—</Typography.Body2>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Typography.Caption1 className="text-muted-foreground">
            {t('plans.details.fields.amount')}
          </Typography.Caption1>
          <Typography.Body2>{formatAmount.format(plan.amount)}</Typography.Body2>
        </div>

        <div className="flex flex-col gap-1">
          <Typography.Caption1 className="text-muted-foreground">
            {t('plans.details.fields.targetDate')}
          </Typography.Caption1>
          <Typography.Body2>{formatDate.format(new Date(plan.targetDate))}</Typography.Body2>
        </div>
      </Dialog.Body>

      <Dialog.Footer className="justify-between">
        <Button.Base variant="destructive" onClick={onDelete}>
          <LucideTrash2 />
          {t('plans.details.actions.delete')}
        </Button.Base>
        <div className="flex gap-2.5">
          <Button.Base variant="outline" onClick={onEdit}>
            <LucidePencil />
            {t('plans.details.actions.edit')}
          </Button.Base>
          <Button.Base onClick={onExecute}>
            <LucideCheck />
            {t('plans.details.actions.execute')}
          </Button.Base>
        </div>
      </Dialog.Footer>
    </div>
  );
};
```

- [ ] **Step 3: Create `ui/delete-confirm-dialog.tsx`**

```tsx
import { type useRemovePlanMutation } from '@/entities/plans';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Typography } from '@/shared/ui/typography';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { getMutationErrorMessage } from '../model/errors';

interface DeleteConfirmDialogProps {
  open: boolean;
  planId: string;
  mutation: ReturnType<typeof useRemovePlanMutation>;
  onCancel: () => void;
  onConfirmed: () => void;
}

export const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({
  open,
  planId,
  mutation,
  onCancel,
  onConfirmed,
}) => {
  const { t } = useTranslation();
  const mutationError = getMutationErrorMessage(mutation.error);

  const handleOpenChange = (next: boolean) => {
    if (mutation.isPending) return;
    if (!next) {
      mutation.reset();
      onCancel();
    }
  };

  const handleConfirm = async () => {
    await mutation.mutateAsync(planId);
    mutation.reset();
    onConfirmed();
  };

  return (
    <Dialog.Base open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>{t('plans.delete.title')}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Dialog.Description>{t('plans.delete.description')}</Dialog.Description>
          {mutationError && (
            <Typography.Caption1 className="text-destructive">{mutationError}</Typography.Caption1>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button.Base
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={mutation.isPending}
          >
            {t('plans.delete.cancel')}
          </Button.Base>
          <Button.Base
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('plans.delete.deleting') : t('plans.delete.confirm')}
          </Button.Base>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Base>
  );
};
```

- [ ] **Step 4: Verify lint + types**

Run: `npm run lint && npx tsc -b`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/manage-plan/ui/modal-close-button.tsx src/features/manage-plan/ui/plan-view.tsx src/features/manage-plan/ui/delete-confirm-dialog.tsx
git commit -m "feat: add plan view and delete-confirm dialog"
```

---

### Task 6: Edit form

**Files:**
- Create: `src/features/manage-plan/ui/plan-edit-form.tsx`

**Interfaces:**
- Consumes: `Plan`, `useUpdatePlanMutation` from `@/entities/plans`; `expenseCategoriesQueryOptions` from `@/entities/expense-categories`; `CategorySelect` from `@/shared/ui/category-select` (Task 4); `editPlanFormSchema`, `getEditPlanFormValues` from `../model/edit-plan-form`; helpers from `../model/errors`.
- Produces: `PlanEditForm` — props `{ plan: Plan; mutation: ReturnType<typeof useUpdatePlanMutation>; onCancel: () => void; onSuccess: (updated: Plan | null) => void }`.

- [ ] **Step 1: Create `ui/plan-edit-form.tsx`**

```tsx
import { type Plan, type useUpdatePlanMutation } from '@/entities/plans';
import { expenseCategoriesQueryOptions } from '@/entities/expense-categories';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { CategorySelect } from '@/shared/ui/category-select';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { LucideCheck } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { editPlanFormSchema, getEditPlanFormValues } from '../model/edit-plan-form';
import { getFirstFieldError, getMutationErrorMessage, mapErrorMessage } from '../model/errors';

interface PlanEditFormProps {
  plan: Plan;
  mutation: ReturnType<typeof useUpdatePlanMutation>;
  onCancel: () => void;
  onSuccess: (updated: Plan | null) => void;
}

export const PlanEditForm: FC<PlanEditFormProps> = ({
  plan,
  mutation,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { data: categoriesData } = useQuery(expenseCategoriesQueryOptions.findAll());
  const categories = categoriesData ?? [];
  const mutationError = getMutationErrorMessage(mutation.error);

  const form = useForm({
    defaultValues: getEditPlanFormValues(plan),
    validators: { onSubmit: editPlanFormSchema },
    onSubmit: async ({ value }) => {
      const updated = await mutation.mutateAsync({
        planId: plan._id,
        payload: {
          description: value.description.trim(),
          categoryId: value.categoryId,
          amount: Number(value.amount),
          targetDate: value.targetDate,
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
        <Dialog.Title>{t('plans.edit.title')}</Dialog.Title>
        <div className="flex gap-2.5">
          <Button.Base type="submit" disabled={mutation.isPending}>
            <LucideCheck />
            {mutation.isPending ? t('plans.edit.saving') : t('plans.edit.save')}
          </Button.Base>
          <Button.Base
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            {t('plans.edit.cancel')}
          </Button.Base>
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
                  placeholder={t('plans.edit.fields.description')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
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

            return (
              <div>
                <CategorySelect
                  options={categories}
                  value={field.state.value}
                  onValueChange={(value) => {
                    clearMutationError();
                    field.handleChange(value);
                  }}
                  onBlur={field.handleBlur}
                  placeholder={t('plans.edit.fields.category')}
                  disabled={mutation.isPending}
                  hasError={Boolean(fieldError)}
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
                  placeholder={t('plans.edit.fields.amount')}
                  hasError={Boolean(fieldError)}
                  disabled={mutation.isPending}
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
              <div>
                <Input.Base
                  id="edit-plan-date"
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
```

Note: the edit header uses a textual Cancel button (not the X), matching the spec (Save + Cancel). The category field uses the shared `CategorySelect` from Task 4.

- [ ] **Step 2: Verify lint + types**

Run: `npm run lint && npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/manage-plan/ui/plan-edit-form.tsx
git commit -m "feat: add plan edit form"
```

---

### Task 7: Execute form

**Files:**
- Create: `src/features/manage-plan/ui/plan-execute-form.tsx`

**Interfaces:**
- Consumes: `Plan`, `useClosePlanMutation` from `@/entities/plans`; `executePlanFormSchema`, `getExecutePlanFormValues` from `../model/execute-plan-form`; helpers from `../model/errors`.
- Produces: `PlanExecuteForm` — props `{ plan: Plan; mutation: ReturnType<typeof useClosePlanMutation>; onCancel: () => void; onSuccess: () => void }`.

- [ ] **Step 1: Create `ui/plan-execute-form.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify lint + types**

Run: `npm run lint && npx tsc -b`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/manage-plan/ui/plan-execute-form.tsx
git commit -m "feat: add plan execute (close) form"
```

---

### Task 8: Orchestrator dialog + feature barrel

**Files:**
- Create: `src/features/manage-plan/ui/plan-details-dialog.tsx`
- Create: `src/features/manage-plan/index.ts`

**Interfaces:**
- Consumes: `Plan`, `useUpdatePlanMutation`, `useRemovePlanMutation`, `useClosePlanMutation` from `@/entities/plans`; `PlanView`, `PlanEditForm`, `PlanExecuteForm`, `DeleteConfirmDialog` from sibling files; `Dialog` from `@/shared/ui/dialog`.
- Produces: `PlanDetailsDialog` — props `{ plan: Plan | null; onClose: () => void }` (re-exported from `index.ts`).

- [ ] **Step 1: Create `ui/plan-details-dialog.tsx`**

```tsx
import {
  type Plan,
  useClosePlanMutation,
  useRemovePlanMutation,
  useUpdatePlanMutation,
} from '@/entities/plans';
import { Dialog } from '@/shared/ui/dialog';
import { type FC, useEffect, useState } from 'react';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { PlanEditForm } from './plan-edit-form';
import { PlanExecuteForm } from './plan-execute-form';
import { PlanView } from './plan-view';

type Mode = 'view' | 'edit' | 'execute';

interface PlanDetailsDialogProps {
  plan: Plan | null;
  onClose: () => void;
}

export const PlanDetailsDialog: FC<PlanDetailsDialogProps> = ({ plan, onClose }) => {
  const [activePlan, setActivePlan] = useState<Plan | null>(plan);
  const [mode, setMode] = useState<Mode>('view');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateMutation = useUpdatePlanMutation();
  const removeMutation = useRemovePlanMutation();
  const closeMutation = useClosePlanMutation();

  const isPending = updateMutation.isPending || removeMutation.isPending || closeMutation.isPending;
  const open = Boolean(plan);

  useEffect(() => {
    if (plan) setActivePlan(plan);
  }, [plan]);

  const resetState = () => {
    setMode('view');
    setConfirmingDelete(false);
    updateMutation.reset();
    removeMutation.reset();
    closeMutation.reset();
  };

  const closeModal = () => {
    resetState();
    onClose();
  };

  const handleOpenChange = (next: boolean) => {
    if (isPending) return;
    if (!next) closeModal();
  };

  return (
    <>
      <Dialog.Base open={open} onOpenChange={handleOpenChange}>
        <Dialog.Content>
          {activePlan && mode === 'view' && (
            <PlanView
              plan={activePlan}
              onEdit={() => setMode('edit')}
              onExecute={() => setMode('execute')}
              onDelete={() => setConfirmingDelete(true)}
              onClose={() => handleOpenChange(false)}
            />
          )}

          {activePlan && mode === 'edit' && (
            <PlanEditForm
              plan={activePlan}
              mutation={updateMutation}
              onCancel={() => {
                updateMutation.reset();
                setMode('view');
              }}
              onSuccess={(updated) => {
                if (updated) setActivePlan(updated);
                setMode('view');
              }}
            />
          )}

          {activePlan && mode === 'execute' && (
            <PlanExecuteForm
              plan={activePlan}
              mutation={closeMutation}
              onCancel={() => {
                closeMutation.reset();
                setMode('view');
              }}
              onSuccess={closeModal}
            />
          )}
        </Dialog.Content>
      </Dialog.Base>

      {activePlan && (
        <DeleteConfirmDialog
          open={confirmingDelete}
          planId={activePlan._id}
          mutation={removeMutation}
          onCancel={() => setConfirmingDelete(false)}
          onConfirmed={closeModal}
        />
      )}
    </>
  );
};
```

- [ ] **Step 2: Create `index.ts`**

```ts
export { PlanDetailsDialog } from './ui/plan-details-dialog';
```

- [ ] **Step 3: Verify lint + types**

Run: `npm run lint && npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/manage-plan/ui/plan-details-dialog.tsx src/features/manage-plan/index.ts
git commit -m "feat: add plan details dialog orchestrator"
```

---

### Task 9: Wire into the Plans widget + final verification

**Files:**
- Modify: `src/widgets/plans/plans.tsx`

**Interfaces:**
- Consumes: `PlanDetailsDialog` from `@/features/manage-plan`; `Plan` and `plansQueryOptions` from `@/entities/plans`.

- [ ] **Step 1: Update `src/widgets/plans/plans.tsx`**

Replace the entire file with:

```tsx
import { type Plan, plansQueryOptions } from '@/entities/plans';
import { CreatePlanButton } from '@/features/create-plan';
import { PlanDetailsDialog } from '@/features/manage-plan';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Table } from '@/shared/ui/table';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { type FC, useState } from 'react';

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
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <Card.Base>
      <Card.Header>
        <Card.Title>Планирование</Card.Title>
        <Card.Controls>
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
                <Table.Row
                  key={plan._id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-muted"
                  onClick={() => setSelectedPlan(plan)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedPlan(plan);
                    }
                  }}
                >
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

      <PlanDetailsDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </Card.Base>
  );
};
```

- [ ] **Step 2: Confirm `Table.Row` forwards `onClick` / `onKeyDown` / `role` / `tabIndex`**

Run: `grep -n "TableRow" src/shared/ui/table/table.tsx`
Expected: `TableRow` spreads `...props` onto its element (it uses `ComponentProps<'tr'>`/`<div>` with `{...props}`). If it does NOT spread props, add `{...props}` to the underlying element before continuing.

- [ ] **Step 3: Verify lint + full build**

Run: `npm run lint && npm run build`
Expected: no errors; `vite build` completes.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, open the dashboard, then verify:
- Clicking a Plans row opens the details modal showing description, category chip, amount, and date.
- **Edit**: Edit/Delete/Execute disappear, fields prefill correctly (date shows the plan's date, amount shows the number), Save persists and returns to view with updated data; Cancel discards changes and returns to view.
- **Delete**: confirmation dialog appears; Delete removes the plan and closes the modal; the row disappears from the list; Cancel keeps it.
- **Execute**: form prefilled with today's date, plan amount, plan description; Reset restores defaults after edits; Confirm closes the plan, removes it from the active list, and the expenses/reports widgets refresh. Cancel returns to view.
- Closing the modal (X or backdrop) while in edit/execute mode and reopening shows a fresh view (form state reset).

- [ ] **Step 5: Commit**

```bash
git add src/widgets/plans/plans.tsx
git commit -m "feat: open plan details modal from plans table rows"
```

---

## Self-Review Notes

- **Spec coverage:** view modal (Task 5/8), edit mode with DTO fields + Save/Cancel + reset-on-cancel (Task 6/8), delete with confirmation (Task 5/8), execute calling `/plans/:id/close` via new mutation hook (Task 1/7), close-resets-form-state (Task 8), prefilled execute form with Reset (Task 7). All covered.
- **Shared CategorySelect** (Task 4) is extracted to remove the verbatim category-dropdown duplication; create-plan is refactored onto it and the edit form consumes it. The component is presentational (lives in `shared/`, takes `options` as a prop, no entity import).
- **Cross-entity invalidation** for close is in Task 1 (`['expenses']`, `['reports']`).
- **Date format** handled by `toDateInputValue` / `todayDateInputValue` (Task 3) and rendered via `new Date(...)` in views.
- **Mutation signatures** `{ planId, payload }` are consistent across Tasks 1, 6, 7, 8.
- **Pre-existing working-tree changes:** `src/shared/ui/table/table.tsx` and `src/widgets/plans/plans.tsx` already have uncommitted edits on this branch. Task 9 rewrites `plans.tsx` wholesale (safe). The `table.tsx` change is unrelated and can be committed separately or left as-is.
