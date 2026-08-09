## 1. Shared Expense Form Foundation

- [x] 1.1 Move the creation form model, item row, and dialog-field UI into `manage-expense`, rename creation-specific
  internals to expense-form concepts, and keep imports within FSD locality rules.
- [x] 1.2 Split the existing creation dialog into a thin `CreateExpenseButton` container and one reusable internal form
  component without changing creation initialization, validation, item, category, pending, or error behavior.
- [x] 1.3 Export `CreateExpenseButton` from `manage-expense`, update the expense widget import, remove the obsolete
  `create-expense` slice, and retain the current-month creation trigger in every existing render state.
- [x] 1.4 Move and update the existing form-model regression tests so the generalized helpers continue covering
  creation defaults, validation, item operations, amount calculation, and `CreateExpenseDto` mapping.

## 2. Edit Form Model

- [x] 2.1 Add pure mapping from an `Expense` to string-backed form values, including local item identifiers and the
  date-input-compatible transaction date.
- [x] 2.2 Add minor-unit comparison that initializes automatic amount mode when saved amount equals the item-price total
  and manual override otherwise, preserving the existing price-only calculation rule.
- [x] 2.3 Add an `UpdateExpenseDto` mapper that excludes `transactionDate`, converts numeric fields, trims identifiers
  and item names, and explicitly sends cleared merchant, description, and item-list values.
- [x] 2.4 Add focused model tests for edit prefilling, automatic/manual mode detection, immutable-date omission, numeric
  conversion, text trimming, and clearing optional values and all items.

## 3. Edit Dialog and Row Action

- [x] 3.1 Build the controlled edit-dialog container around the reusable form with selected-expense initialization,
  disabled date input, idle discard/reset, pending interaction lock, success close, failure preservation, and retry.
- [x] 3.2 Build edit category options from active categories plus the expense's current archived category, hide every
  other archived category, and handle loading, retryable failure, empty-active, and unrepresentable-current states.
- [x] 3.3 Add the `IcPencil20` `Редактировать` menu item before `Удалить`, open editing without toggling the row
  accordion, and preserve Base UI keyboard behavior and ellipsis-trigger focus restoration.
- [x] 3.4 Pass the complete loaded `Expense` from each eligible current-month widget row into `ExpenseActions` while
  retaining the existing historical-period gate, grid layout, loading skeleton, and deletion flow.
- [x] 3.5 Add Russian edit labels, accessible names, pending text, category/data errors, and retryable submission error
  without changing creation or deletion wording.

## 4. Update Cache Consistency

- [x] 4.1 Add a focused cache helper that replaces a server-confirmed expense in every cached paginated expense list
  containing its id without changing pagination totals or unrelated lists.
- [x] 4.2 Extend `useUpdateExpenseMutation` to update detail and list caches from the response and dispatch invalidation
  for expenses, transactions, reports, expense limits, balances, and the affected account snapshots.
- [x] 4.3 Add or expose the entity `@x/expenses` query-key contracts required by the update hook and verify that dependent
  refresh failures cannot change a confirmed update into a retryable mutation error.

## 5. Verification

- [x] 5.1 Run the expense form-model tests and resolve every regression in creation and edit helper behavior.
- [x] 5.2 Run `npm run lint` and resolve every introduced lint issue.
- [x] 5.3 Run `npm run lint:architecture` and resolve every introduced FSD boundary issue.
- [x] 5.4 Run `npm run build` and resolve every introduced TypeScript or production-build issue.
- [x] 5.5 Manually verify current-month-only edit visibility, menu order, keyboard operation, accordion isolation, dialog
  prefilling, disabled date, active and archived category cases, item editing, both amount modes, idle discard, optional
  field clearing, pending lock, success refresh, failure preservation, retry, and focus restoration.
- [x] 5.6 Manually regression-check current-month expense creation and deletion after the feature consolidation.
