## Why

Users can review individual expenses in the dashboard table, but they cannot remove an incorrect expense without
leaving the interface. Adding a confirmed row action closes that workflow gap while keeping all derived financial
figures consistent with the deletion.

## What Changes

- Add an icon-only actions trigger at the right edge of expense rows only while the dashboard is showing the current
  calendar month; omit the trigger when the selected period has no available actions.
- Add a destructive delete action represented by a red cross and the visible localized label "Удалить" that opens a
  confirmation dialog before sending any request.
- Delete the underlying transaction through the existing transaction delete endpoint and expose deterministic pending,
  success, cancellation, and retryable failure states.
- Remove a successfully deleted expense from cached expense lists immediately and refresh every related expense,
  report, limit, balance, transaction, and account-snapshot query.
- Add localized visible text and accessible labels for the row action, confirmation, pending state, and errors.

## Capabilities

### New Capabilities

- `expense-deletion`: Accessible expense-row actions, confirmed transaction deletion, failure recovery, and consistent
  refresh of all expense-dependent dashboard data.

### Modified Capabilities

None.

## Impact

- Adds a dedicated expense-management feature under `src/features/manage-expense` and integrates it into
  `src/widgets/expenses`.
- Generalizes the currently unused transaction deletion mutation and exposes the query keys needed for coordinated
  cache refresh while preserving Feature-Sliced Design import direction.
- Reuses the existing `DELETE /transactions/:id` backend contract, Base UI menu and alert-dialog primitives, shared
  icon assets, and TanStack Query; no new dependency or backend change is required.
- Updates Russian translations and the expense-table loading layout to account for the conditional actions column.
