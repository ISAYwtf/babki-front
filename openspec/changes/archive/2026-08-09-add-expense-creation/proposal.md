## Why

Users can review and delete expenses from the dashboard table, but they cannot record a new expense without leaving
the dashboard workflow. Adding an in-context creation dialog makes expense entry available where users already review
the current month's transactions and keeps every expense-derived widget consistent after creation.

## What Changes

- Add a plus action to the expense-table widget while the dashboard shows the user's current local calendar month,
  including the widget's loading, empty, and populated states.
- Add an expense-creation dialog for category, amount, date, merchant, description, and an optional itemized list.
- Support sequential item entry with integer quantity controls, item prices, per-item removal, and conditional form
  validation that requires either a description or at least one valid item.
- Calculate the total as the sum of item prices, independently of item quantities, until the user manually overrides
  it; entering zero or clearing the amount clears the override and restores automatic calculation.
- Submit through the existing expense creation API and refresh all expense-dependent transaction, report, limit,
  balance, and account-snapshot data after a successful request.
- Add localized loading, validation, empty-category, pending, and server-error states without changing the backend
  endpoint contract.

## Capabilities

### New Capabilities

- `expense-creation`: Current-period expense entry, optional itemization, total calculation and override behavior,
  validation, submission, failure recovery, and dependent-data refresh.

### Modified Capabilities

None.

## Impact

- Adds a new feature under `src/features/create-expense` and integrates its trigger into `src/widgets/expenses`.
- Reuses the existing expense-category selector, category query, expense create mutation, TanStack Form, Zod, and shared
  dialog/input/button components.
- Tightens creation-form validation without changing the `/expenses` request shape.
- Extends successful expense-creation cache invalidation across existing expense-dependent entity queries.
- Adds Russian localization strings and requires `npm run lint`, `npm run lint:architecture`, `npm run build`, and
  manual verification of the affected dashboard states.
