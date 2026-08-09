## Context

The current-month expense table already exposes an ellipsis menu owned by `manage-expense`, but that menu only
supports deletion. Expense creation lives in a separate `create-expense` feature whose dialog contains the required
category, amount, transaction date, merchant, description, and dynamic item-list behavior. The expense entity already
exposes `PATCH /expenses/:id` and `useUpdateExpenseMutation`, while the update schema deliberately excludes
`transactionDate`.

Editing must reuse the creation interaction rather than introduce a second form that can drift. The project enforces
Feature-Sliced Design import locality, so sibling features cannot depend on each other's internals. An expense update
can also change every financial aggregate that creation and deletion affect, which makes the current update hook's
expense-list-only invalidation insufficient.

## Goals / Non-Goals

**Goals:**

- Edit an expense from its existing current-month row actions menu.
- Reuse one form implementation for creation and editing while preserving creation behavior.
- Prefill every displayed field, keep the date unavailable for editing, and correctly support archived current
  categories and clearing optional values.
- Preserve automatic-versus-manual amount semantics when initializing an existing expense.
- Keep failed edits recoverable and refresh all expense-dependent client data after success.
- Preserve keyboard menu behavior, modal focus restoration, and localized accessible names.

**Non-Goals:**

- Editing the transaction date or enabling row actions for historical periods.
- Changing the expense update endpoint, backend schema, persisted data, or routing.
- Adding edit history, confirmation for discarded changes, optimistic server writes, or category creation inside the
  form.
- Changing the established expense-creation validation or automatic-total product rules.

## Decisions

### Consolidate expense operations in `manage-expense`

Move `CreateExpenseButton` and the reusable expense-form model and UI into `src/features/manage-expense`. Keep thin
create and edit containers around one internal form component: each container owns its mutation, title, initialization,
and submit mapping, while the shared form owns fields, validation presentation, item manipulation, category states,
and amount-mode behavior. Export `CreateExpenseButton` and `ExpenseActions` from the feature public API and remove the
now-empty `create-expense` slice.

This follows import locality and keeps all user-triggered expense management in one feature. Keeping the two features
would require either a forbidden sibling import or an artificial lower-layer abstraction with injected domain UI.
Copying the form was rejected because its validation, pending, category, and item behavior would diverge.

### Pass the loaded expense to the row action feature

Change `ExpenseActions` to receive the complete `Expense` returned by the table query instead of only identifiers.
Selecting `Редактировать` closes the menu and opens a controlled edit dialog initialized from that object, without an
extra detail request. The menu remains mounted only for the current local calendar month because the widget retains
the existing `useIsCurrentPeriod()` gate.

Render the pencil item before the destructive delete item. Continue using a portal so the menu is not clipped by the
table. Keep a reference to the ellipsis trigger and return focus to it after an idle edit close or successful edit when
the row still exists.

### Use one string-backed form model with mode-specific initialization and mapping

Retain the current string-backed values for amount, quantity, and price so incomplete typing states remain
representable. Generalize creation-named form helpers to expense-form names and provide two initializers:

- creation starts with empty values and the current local date;
- editing maps category id, numeric values, merchant, description, date, and items from the selected `Expense`.

Each mapped item receives a new local UUID used only as a React/form key. The edit date is displayed in the same input
but disabled, and the update mapper never includes it.

Creation continues omitting blank optional values. Editing sends a complete editable snapshot: trimmed category and
numeric values plus explicit empty strings for cleared merchant and description and `items: []` when all positions are
removed. This distinction is required by PATCH semantics; omitting an emptied field could leave its old server value
unchanged.

### Derive the initial amount mode from existing data

Calculate the existing item total using the creation form's established minor-unit arithmetic and price-only rule. If
the normalized saved amount equals that total, initialize automatic mode; subsequent item changes update the amount.
If they differ, initialize manual-override mode and preserve the saved amount while items change. Clearing the amount
or entering numeric zero returns to automatic mode, exactly as in creation.

Comparing normalized minor units avoids a false manual override caused by floating-point representation. Introducing a
stored amount-mode flag was rejected because the API has no such field and the mode can be derived deterministically.

### Preserve the selected archived category without reopening the archive

Build edit options from every active category plus the expense's current category when it is archived. This lets the
user submit without changing a historically valid association, but once an active replacement is chosen no other
archived category becomes selectable. If the current category cannot be represented from either the expense or loaded
category data, show a non-submittable localized data error instead of sending an unknown id.

Creation continues showing active categories only. Both modes retain the existing loading, retry, empty, and pending
states.

### Reconcile the expense response and all dependent query families

Extend `useUpdateExpenseMutation` so a successful response replaces the matching item in every cached paginated
expense list and updates the detail cache. Then invalidate expense lists/details, general transactions, reports,
expense limits, balances, and account snapshots for the response's `accountId`. Use explicit entity cross-APIs where
needed to preserve FSD boundaries.

The local replacement gives the table and expense-derived widgets immediate consistent data; invalidation restores
server-authoritative pagination and aggregates. Dependent refresh failures occur after the server-confirmed edit and
must not reopen the dialog or report the mutation itself as failed.

### Keep edit submission recoverable

During mutation, disable save, close, dismissal, fields, and item controls. On failure, retain the form values and
display a localized retryable error; changing a value clears the stale general error. On success, close and reset the
dialog. An idle close discards unsaved changes without confirmation, and reopening initializes from the latest expense
object supplied by the widget.

## Risks / Trade-offs

- **The row object can become stale while the dialog is open** → Invalidate after mutations and reinitialize on each
  new open; do not overwrite active user edits because of a background refetch.
- **Explicit empty strings rely on the existing PATCH contract** → Validate them through `UpdateExpenseDto` and cover
  field-clearing mapping with focused model tests.
- **Broad invalidation creates several refetches** → Begin them together and accept the bounded cost because edits can
  affect every displayed financial aggregate.
- **Moving creation code increases the change footprint** → Preserve the public component contract and creation specs,
  then verify creation as a regression path.
- **An archived category can disappear from the category response** → Retain the embedded current category from the
  loaded expense as the only archived option.
- **No configured UI test runner covers dialogs** → Keep mapping and calculation logic pure, extend the existing model
  tests, run static checks, and manually verify focus, menu, and modal behavior.

## Migration Plan

1. Generalize the existing form model and UI inside `manage-expense` while keeping creation behavior intact.
2. Move the creation entry point and update widget imports through the new public API.
3. Add edit mapping, dialog state, menu action, localization, and archived-category handling.
4. Extend update cache reconciliation and dependent invalidation.
5. Run model tests, lint, architecture lint, build, and the focused manual interaction matrix.

Rollback restores the separate `create-expense` feature and removes the edit item, dialog, and expanded update cache
policy. No backend or data rollback is required.

## Open Questions

None. Date immutability, current-period scope, archived-category handling, amount-mode initialization, discard behavior,
and feature consolidation were agreed during exploration.
