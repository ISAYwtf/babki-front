# Plan details modal with edit / delete / execute

**Date:** 2026-06-23
**Status:** Approved

## Goal

Add a modal that opens when a row in the Plans table is clicked. The modal shows
the selected plan's details and exposes three actions — **Edit**, **Delete**, and
**Execute** — backed by the existing backend contract (`PATCH /plans/:id`,
`DELETE /plans/:id`, `POST /plans/:id/close`).

## Behaviour summary

- **View mode** (default): read-only plan details with Edit / Delete / Execute buttons.
- **Edit mode**: fields become editable per the update schema. Edit/Delete/Execute
  disappear; Save + Cancel appear. Cancel resets changes and returns to view.
- **Delete**: opens a confirmation dialog (Delete / Cancel). Confirm deletes the plan.
- **Execute**: opens a prefilled, editable close form (closing date, amount,
  description) with a **Reset** button restoring defaults; Confirm calls the close
  endpoint, Cancel returns to view.
- **Closing the modal resets all form state** (mode → view, both forms reset,
  mutation errors cleared, delete-confirm cleared).

## Verified constraints

These were confirmed against the codebase and must be honoured by the implementation:

1. **Date format.** Backend `targetDate` / `closedAt` are Mongoose `Date` and
   serialize as full ISO strings (e.g. `2026-06-22T00:00:00.000Z`). `<input
   type="date">` requires `yyyy-MM-dd`, so prefill must slice via
   `new Date(value).toISOString().slice(0, 10)`. Using the UTC slice avoids a
   timezone day-shift because plan dates are stored at UTC midnight. Submitting the
   raw `yyyy-MM-dd` value back is accepted by the backend's `@IsDateString()`
   (the create-plan feature already does this).
2. **Cross-entity invalidation on close.** `POST /plans/:id/close` creates a real
   expense transaction server-side. The expenses-by-months / annual-expenses /
   reports widgets are co-rendered on the same dashboard, so the close mutation
   must invalidate `['expenses']` and `['reports']` in addition to the plans list.
   This follows the existing precedent in `saves`/`debts` mutation hooks.
3. **Mutation signatures.** `update` and `close` need both `planId` and a payload,
   unlike `create`'s single argument. Wrap as
   `mutationFn: ({ planId, payload }) => plansApi.update(planId, payload)`
   (mirrors the existing `useUpdateExpenseMutation`).
4. **String-typed form values.** Form amount values are strings, so prefill uses
   `String(plan.amount)`.

## Architecture

Import direction stays within FSD: `widgets → features → entities → shared`.

### Entity layer — `src/entities/plans`

**`model/schemas.ts`** — add:

- `updatePlanPayloadSchema` — `description`, `targetDate`, `amount`, `categoryId`,
  all `.optional()` (mirrors `UpdatePlanDto`).
- `closePlanPayloadSchema` — `closingDate`, `amount`, `description`, all
  `.optional()` (mirrors `ClosePlanDto`).
- Types `UpdatePlanPayload`, `ClosePlanPayload`.

**`api/plans.api.ts`** — add methods following the class pattern (validate payload
→ request → `parseWithSchema` on response):

- `update = async (planId: string, payload: UpdatePlanPayload)` → `PATCH /plans/:planId`,
  parse response with `planSchema`.
- `remove = async (planId: string)` → `DELETE /plans/:planId`, returns void (no
  response parse — backend returns no body).
- `close = async (planId: string, payload: ClosePlanPayload)` → `POST /plans/:planId/close`,
  parse response with `planSchema`.

**`api/plans.query.ts`** — add hooks:

- `useUpdatePlanMutation` — `mutationFn: ({ planId, payload }) => plansApi.update(planId, payload)`;
  `onSuccess` invalidates `plansQueryKeys.listAll()`.
- `useRemovePlanMutation` — `mutationFn: plansApi.remove`; `onSuccess` invalidates
  `plansQueryKeys.listAll()`.
- `useClosePlanMutation` — `mutationFn: ({ planId, payload }) => plansApi.close(planId, payload)`;
  `onSuccess` invalidates `plansQueryKeys.listAll()`, `['expenses']`, and `['reports']`.

No `findOne` query option is added — the row already carries the full `Plan`.

### Feature — `src/features/manage-plan`

```
features/manage-plan/
  model/
    edit-plan-form.ts      # zod form schema (required fields) + defaults-from-plan helper
    execute-plan-form.ts   # zod form schema (closingDate/amount/description) + defaults-from-plan
    errors.ts              # shared mapErrorMessage / getFirstFieldError / getMutationErrorMessage
  ui/
    plan-details-dialog.tsx   # orchestrator: mode state machine, owns both forms
    plan-view.tsx             # read-only details + Edit / Delete / Execute buttons
    plan-edit-form.tsx        # editable fields, Save / Cancel
    plan-execute-form.tsx     # prefilled close form, Reset + Confirm / Cancel
    delete-confirm-dialog.tsx # confirmation (Delete / Cancel)
  index.ts                    # exports PlanDetailsDialog only
```

**Orchestrator (`plan-details-dialog.tsx`)**

- Props: `plan: Plan | null`, `onClose: () => void`.
- Open state derived as `open = !!plan`.
- Keeps an internal copy of the plan synced from props (only updated while props are
  non-null) so the modal content stays rendered through the base-ui close animation.
- State: `mode: 'view' | 'edit' | 'execute'` and `confirmingDelete: boolean`.
- Owns the edit form and execute form (`useForm` each), seeded from the plan.
- `handleOpenChange(false)` is blocked while any mutation is pending; otherwise it
  resets `mode` → `'view'`, resets both forms, resets all mutation hooks, clears
  `confirmingDelete`, and calls `onClose`.
- On any successful mutation: close the modal (invalidation refreshes the list;
  closed/deleted plans drop out of the active filter automatically).

**`plan-view.tsx`** — read-only details (description, category, amount formatted as
currency, target date formatted). Edit / Delete / Execute buttons that switch mode
or open delete-confirm.

**`plan-edit-form.tsx`** — fields prefilled from the plan: description, category
(Select), amount (`String(plan.amount)`), targetDate (ISO slice). Save calls
`useUpdatePlanMutation`; Cancel resets the edit form to plan values and returns to
view. Field/mutation error handling mirrors the create-plan feature.

**`plan-execute-form.tsx`** — prefilled close form: closingDate (today, `yyyy-MM-dd`),
amount (`String(plan.amount)`), description (`plan.description`). Reset restores those
defaults. Confirm calls `useClosePlanMutation`; Cancel returns to view. Category is
fixed by the plan and not shown.

**`delete-confirm-dialog.tsx`** — confirmation with destructive Delete + Cancel.
Confirm calls `useRemovePlanMutation`, then closes the whole modal.

**`model/edit-plan-form.ts`** — `editPlanFormSchema` with required fields
(description, categoryId, amount, targetDate) reusing the create-plan validation
codes (`required`, `descriptionTooLong`, `invalid`, `min`); a helper to build
default values from a `Plan`.

**`model/execute-plan-form.ts`** — `executePlanFormSchema` for closingDate / amount /
description; a helper to build default values from a `Plan`.

**`model/errors.ts`** — extract the `mapErrorMessage`, `getFirstFieldError`,
`getMutationErrorMessage` helpers currently inline in create-plan so both forms reuse
them. (The create-plan feature may be refactored to import these too, but that is
optional and not required for this task.)

### Widget — `src/widgets/plans/plans.tsx`

- `const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)`.
- Each `Table.Row` gets `onClick={() => setSelectedPlan(plan)}`, `cursor-pointer`,
  hover affordance, and accessible activation (role/keyboard handling).
- Render a single `<PlanDetailsDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />`.

### i18n — `src/shared/lib/i18n/ru/main.json`

Extend the `plans` tree with `details`, `edit`, `delete`, and `execute` sub-trees
(titles, field labels, button labels, confirmation text). Reuse existing `validation.*`
keys for field errors. Add corresponding typed keys.

## Error handling

- Field errors: `getFirstFieldError(field.state.meta.errors)` → `mapErrorMessage(...)`,
  displayed under each input (same as create-plan).
- Mutation errors: reset the relevant mutation on field change; display
  `getMutationErrorMessage(mutation.error)` below the form body.
- The backend rejects updating/closing an already-closed plan; since the widget lists
  only `status: 'active'` plans, this is an edge case surfaced via the mutation error
  message rather than special-cased.

## Testing

No test runner is configured in the project. Verification is manual via `npm run dev`
plus `npm run lint` and `npm run build` (tsc) for type safety.

## Out of scope (YAGNI)

- No `findOne` query option.
- No optimistic updates.
- No separate edit/delete/execute features (single `manage-plan` feature).
- No category change in the execute form (category is fixed by the plan).
