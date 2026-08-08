## Why

Users can review category spending against expense limits, but the dashboard does not provide an in-context way to
create, adjust, or remove those limits. Adding management to the existing monthly limit widget lets users maintain the
limits for the period they are already reviewing without navigating to a separate workflow.

## What Changes

- Add a gear action to the monthly expense-limits widget in its loading, empty, and populated states.
- Add a "Лимиты" dialog for the selected calendar month with inline creation, amount editing, and confirmed deletion.
- Keep persisted limit categories immutable while allowing a category to be selected for a new limit.
- Prevent more than one limit for the same category in a month and allow at most one temporary row at a time.
- Validate positive monetary amounts with at most two decimal places and expose row-specific pending and error states.
- Keep unsaved row drafts local to the dialog, discard them on close, and refresh the widget after successful mutations.

## Capabilities

### New Capabilities

- `expense-limit-management`: In-context monthly expense-limit creation, amount editing, validation, deletion, and
  discard behavior.

### Modified Capabilities

None.

## Impact

- Adds a new feature under `src/features/manage-expense-limits`.
- Integrates the feature into `src/widgets/expense-limits` while preserving Feature-Sliced Design import direction.
- Reuses the existing expense-limit and expense-category APIs, TanStack Query options, and mutation hooks without
  changing the backend contract.
- Adds localized expense-limit management, validation, confirmation, loading, and error messages.
- Relies on expense-limit query invalidation to refresh monthly limit progress after successful mutations.
