## Why

Expenses can currently be created and deleted from the dashboard, but correcting an entered expense requires deleting
and recreating it. Adding an edit action to the existing current-month row menu lets users fix categories, amounts,
descriptions, merchants, and item lists without losing the original transaction.

## What Changes

- Add a localized `Редактировать` item with a pencil icon to the existing expense-row actions menu for the current
  local calendar month.
- Open a modal expense form prefilled from the selected row, with the transaction date visible but unavailable for
  editing.
- Allow editing category, amount, merchant, description, and optional item rows while preserving the creation form's
  validation, item management, and automatic-total behavior.
- Preserve an expense's current archived category while offering only active categories as replacement choices.
- Persist edits through the existing expense update endpoint, including explicit empty values that clear optional
  fields or all items.
- Reconcile cached expenses and refresh every affected transaction, report, limit, balance, and account-snapshot view
  after a confirmed update.
- Consolidate expense creation and management into one `manage-expense` feature with a shared internal form, without
  changing the existing expense-creation behavior.

## Capabilities

### New Capabilities

- `expense-editing`: Covers current-month edit access, prefilled and constrained form behavior, validation,
  submission recovery, and post-update data consistency.

### Modified Capabilities

- `expense-deletion`: Updates the existing expense row-actions menu contract so editing appears before the destructive
  delete operation while preserving deletion behavior.

## Impact

- Affects `src/features/create-expense`, `src/features/manage-expense`, `src/widgets/expenses`, expense entity mutation
  cache policy, and Russian localization.
- Reuses the existing `PATCH /expenses/:id` API; the transaction date remains excluded from `UpdateExpenseDto`.
- Does not add dependencies, change persisted data, or require backend or route changes.
