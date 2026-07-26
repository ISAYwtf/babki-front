## Why

Users can already assign expense categories, but the dashboard does not provide a way to create, rename, recolor, or delete them. Adding in-context management to the expenses-by-categories widget makes category maintenance available where users already review categorized spending.

## What Changes

- Add a gear action to the expenses-by-categories widget in its loading, empty, and populated states.
- Add a "Категории" dialog that lists categories and supports inline creation, editing, color selection, and deletion.
- Provide per-row validation and save actions while keeping unsaved drafts local to the dialog.
- Add a fixed 25-color palette presented as a compact 5-by-5 grid.
- Require confirmation before deleting persisted categories and surface API conflicts without losing local edits.
- Refresh category-dependent cached data after successful mutations.

## Capabilities

### New Capabilities

- `expense-category-management`: In-context creation, editing, color selection, validation, deletion, and discard behavior for user expense categories.

### Modified Capabilities

None.

## Impact

- Adds a new feature under `src/features/manage-expense-categories`.
- Integrates the feature into `src/widgets/expenses-by-categories`.
- Reuses the existing expense-category CRUD API and TanStack Query mutations without changing the backend contract.
- Adds localized category-management and validation messages.
- Invalidates category, expense, and expense-limit query data when category changes can make embedded category data stale.
- Leaves the existing backend behavior for deleting categories linked only to plans or expense limits outside this change.
