## Context

The expense table reads paginated expenses for the selected dashboard period and already supports current-period row
deletion, but its header has no creation action. The expense entity already exposes `CreateExpenseDto`, a validated
`POST /expenses` client, and `useCreateExpenseMutation`; expense categories expose a reusable query and
`CategorySelect`. Existing income, save, category, and limit dialogs establish the trigger, dialog, TanStack Form,
pending, reset, and error-handling patterns to follow.

The backend create contract requires `categoryId`, `amount`, and `transactionDate`; accepts optional `merchant`,
`description`, and `items`; and represents each item with `name`, numeric `quantity`, and numeric `price`. The UI
adds stricter creation-only rules without changing that request shape. The dashboard can show historical periods, so a
today-defaulted creation action must be scoped to the current local calendar month to avoid creating a transaction that
immediately falls outside the visible table.

## Goals / Non-Goals

**Goals:**

- Create expenses from the current-month expense-table header in every widget render state.
- Reuse established FSD, form, dialog, category-selection, localization, and mutation patterns.
- Support an optional sequential item list with integer quantity controls and per-row removal.
- Keep the total calculated from item prices, independently of quantities, until the user explicitly overrides it.
- Enforce the API constraints plus the product rule that a description or at least one valid item is required.
- Preserve recoverable form state on failure and refresh every expense-dependent dashboard query after success.

**Non-Goals:**

- Changing the `/expenses` endpoint or its request/response shape.
- Adding expense editing, category creation inside the expense dialog, receipt scanning, recurring expenses, or file
  attachments.
- Generalizing income, save, and expense creation into a shared transaction-form framework.
- Adding a new test runner or changing how dashboard periods are selected.

## Decisions

### Add a dedicated `create-expense` feature

Create `src/features/create-expense` with a public `CreateExpenseButton`, focused item-row UI, form validation and DTO
mapping, and pure item-total helpers. The expense widget imports only the feature's public API and renders it in
`Card.Controls` when `useIsCurrentPeriod()` is true. The control is present in the widget's loading, empty, and
populated branches so data state does not move or remove the entry point.

Embedding the dialog in `src/widgets/expenses` was rejected because the widget would own querying, mutation,
validation, and dynamic-row state in addition to table rendering. A generic transaction creator was rejected because
the existing income, save, and expense contracts and interactions differ enough that the abstraction would add scope
without eliminating meaningful duplication.

### Keep the dialog form state separate from the API DTO

Use string-backed inputs for amount, quantity, and price so incomplete typing states remain representable. Form items
carry stable local keys plus `name`, `quantity`, and `price` strings. Submission trims strings, converts numeric values,
omits blank optional values, and produces the existing `CreateExpenseDto`:

```ts
{
  categoryId,
  amount: Number(amount),
  transactionDate,
  merchant: merchant.trim() || undefined,
  description: description.trim() || undefined,
  items: items.length
    ? items.map(({ name, quantity, price }) => ({
        name: name.trim(),
        quantity: Number(quantity),
        price: Number(price),
      }))
    : undefined,
}
```

Creation-specific Zod validation requires a category, a parseable date, amount greater than zero, merchant at most
255 characters, description at most 1000 characters, and either a non-whitespace description or at least one item.
Every present item requires a non-whitespace name, integer quantity of at least one, and price greater than zero.
Invalid present rows block submission even when a description exists.

Validate the date-input value with Zod's built-in `z.iso.date()` schema after the required-string check. This enforces
the exact `yyyy-MM-dd` input format and calendar validity, including leap years, without maintaining a local date parser.

Validation messages appear after field interaction or an attempted submit. Blur validation is scoped to the field that
lost focus and does not reveal errors for untouched fields. Because the category selector has no clear affordance, its
required message is deferred until the form is submitted, so merely opening or leaving the empty selector remains
error-free. An attempted submit validates the complete form. A conditional form-level error is placed beside the
description/item-list area when neither content path is satisfied. Keeping these rules in the feature avoids tightening
shared read schemas for historical server data while still guaranteeing a valid create payload.

Configure TanStack Form with `canSubmitWhenInvalid: true` so `handleSubmit()` can pass its initial `canSubmit` guard
after an earlier field-level error and run its own field and form submit validators. The later `isFieldsValid` and
`isValid` checks still prevent the mutation for invalid values. This keeps submit validation owned by TanStack Form and
avoids a duplicate manual validation pass before every valid submission.

### Add items sequentially and keep every row reversible

The form starts without item rows and shows `Список`. Activating it appends one empty item with quantity `1` and
changes the action to `Добавить ещё`. The add action remains disabled until the last row is fully valid, which
enforces one-at-a-time entry without preventing edits to earlier rows. Each row exposes localized decrement, increment,
and remove controls. Decrement is disabled at quantity `1`; direct quantity input accepts only integer values at least
one. Removing the last row restores the initial `Список` label.

Desktop layouts place name, quantity stepper, price, and remove control in one row; narrow layouts may stack the
fields while retaining the same focus order and accessible names. No arbitrary item-count limit is introduced.

### Model calculated and manually overridden totals explicitly

Track an internal `amountOverridden` flag that is not sent to the API. While it is false, any item quantity, price,
addition, or removal synchronizes the amount with the sum of positive item prices. Each price is included exactly once;
quantity is not read by the calculation, so a valid price contributes even while its quantity is empty or invalid.
Quantity remains required for item validity and submission. Round each contributing price to currency minor-unit
precision before writing the total to the string field to avoid floating-point artifacts. An empty new row contributes
zero until its price is valid.

A user-entered nonzero amount sets `amountOverridden` to true. While true, all item mutations preserve the entered
amount. Entering numeric zero or clearing the amount clears the flag and immediately restores the current calculated
total; if no items produce a positive total, the amount remains invalid until the user enters a positive value or
completes items. This explicit mode avoids guessing whether a value that happens to equal the item total was manual.
Programmatic amount updates never set the override flag.

### Initialize and reset each dialog session deterministically

Opening a fresh dialog initializes the date with the user's current local date formatted as `yyyy-MM-dd`, leaves
category, amount, merchant, and description empty, creates no items, and starts in automatic-total mode. Successful
submission or an idle close resets all local form, item, override, and mutation-error state. A failed request leaves the
dialog open and preserves every value for retry. Changing any form field clears a stale general mutation error.

Categories are queried by the feature and rendered through the existing `CategorySelect`. Loading shows a structured
disabled state; a query failure shows a localized retryable error; and an empty successful result explains that a
category must be created first. All three states keep the dialog operable but disable submission when no valid category
can be selected.

During submission, form fields and add, remove, quantity, save, and close actions are disabled, and dismissal through
Escape or the backdrop is prevented. The trigger, dialog controls, quantity controls, item removal, validation errors,
pending state, and category states receive localized visible or accessible text.

### Refresh creation-dependent data without optimistic insertion

Extend `useCreateExpenseMutation` so successful creation invalidates expenses, transactions, reports, expense limits,
balances, and account snapshots for the returned `accountId`. Entity-to-entity query-key access uses explicit `@x`
cross-APIs where required so `npm run lint:architecture` continues to enforce FSD boundaries. Begin independent
invalidations together and absorb refresh failures after dispatch so a server-confirmed create is never reported as a
failed create merely because one dependent refetch fails.

Optimistically appending the response to cached paginated lists was rejected because multiple period and pagination
variants would require ordering and membership logic. Invalidating the existing query families is consistent with the
current data layer and makes the server authoritative. The dialog closes and resets after the create response succeeds;
active widgets then reconcile through their invalidated queries.

## Risks / Trade-offs

- **A manual total can intentionally differ from item arithmetic** → Preserve this explicitly requested behavior and
  make zero or clearing the amount deterministic actions for returning to automatic calculation.
- **The automatic total can include a row whose quantity is currently invalid** → Treat price as the complete row cost;
  keep the displayed sum independent of quantity while validation still blocks adding the next row and submission.
- **Typing zero or clearing the amount immediately replaces it with a calculated total** → Treat both interactions as
  explicit reset signals; when no positive item total exists, keep the amount empty and invalid in automatic mode.
- **A category can disappear between selection and submission** → Preserve the form and display the server error so the
  user can reload or choose another category and retry.
- **Dependent refetches can fail after creation** → Do not reopen the dialog or claim creation failed; active widgets
  retain TanStack Query's recoverable refresh/error behavior.
- **The dialog can grow with many items** → Keep the body scrollable and the header actions reachable; do not impose an
  unrequested item limit.
- **No automated feature test command is configured** → Isolate calculations and validation in pure model code, run
  lint/build/architecture checks, and manually verify the specified interaction matrix.

## Migration Plan

1. Add the feature and localization without changing the server contract or persisted data.
2. Extend the create mutation's cross-entity invalidation and explicit FSD cross-APIs.
3. Integrate the current-period trigger into every expense-widget render branch.
4. Run `npm run lint`, `npm run lint:architecture`, and `npm run build`, then manually verify the current-period,
   category, calculation, validation, submission, and failure states.

Rollback removes the widget integration and feature exports, then restores the narrower create-mutation invalidation;
no data migration or backend rollback is required.

## Open Questions

None. Product behavior and implementation boundaries were agreed during exploration.
