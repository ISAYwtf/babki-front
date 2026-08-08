## 1. Expense Creation Data Flow

- [x] 1.1 Add the explicit entity `@x/expenses` query-key exports needed for expense creation to refresh transactions,
  reports, expense limits, balances, and account snapshots without violating FSD import boundaries.
- [x] 1.2 Extend `useCreateExpenseMutation` to dispatch expense and dependent-query invalidations after a successful
  response, including the returned account's snapshots, while preventing refetch failures from changing create success
  into a form error.
- [x] 1.3 Create the `src/features/create-expense` slice and public export without changing the existing `/expenses`
  request or response schema.

## 2. Form Model and Validation

- [x] 2.1 Define string-backed expense form and item draft types, stable local item keys, fresh-session defaults, and
  current-local-date initialization.
- [x] 2.2 Implement pure helpers for item validity, integer quantity changes, item-total calculation with safe monetary
  rounding, and automatic-versus-manual amount mode transitions.
- [x] 2.3 Implement Zod form validation for required category/date/positive amount, text limits, valid present items, and
  the conditional requirement for a non-whitespace description or at least one valid item.
- [x] 2.4 Implement localized validation-error mapping and the normalized `CreateExpenseDto` mapper that trims strings,
  converts numbers, and omits blank optional values.

## 3. Expense Item Interface

- [x] 3.1 Build an accessible expense-item row with name and price inputs, integer quantity input, increment and
  decrement controls, remove action, pending state, and field-level errors.
- [x] 3.2 Implement `Список` creation with quantity `1`, switch to `Добавить ещё` after the first row, and disable
  adding another row until the current last row is valid.
- [x] 3.3 Implement per-row removal, restoration of `Список` after removing the last row, and automatic-total updates
  for item edits, additions, and removals only while manual override is inactive.
- [x] 3.4 Implement nonzero manual amount override and zero-triggered return to automatic calculation, including the
  invalid state when no positive item total is available.

## 4. Creation Dialog

- [x] 4.1 Build `CreateExpenseButton` with the established plus trigger and dialog header actions, category selector,
  amount, date, merchant, description, and item-list controls.
- [x] 4.2 Handle category loading, load failure, and empty results with localized feedback and disabled submission while
  retaining an operable dialog.
- [x] 4.3 Wire TanStack Form submission to `useCreateExpenseMutation`, retain all values on failure, clear stale request
  errors after edits, and support retry without duplicating requests.
- [x] 4.4 Lock fields and all add, quantity, remove, save, close, Escape, and backdrop interactions while submission is
  pending; close and fully reset the dialog after success or an idle dismissal.
- [x] 4.5 Keep long item lists scrollable, preserve reachable dialog actions, and make the item layout responsive without
  changing keyboard focus order or accessible names.
- [x] 4.6 Add Russian strings for creation labels, category states, item controls, validation, pending, success-reset,
  and request errors.

## 5. Expense Widget Integration

- [x] 5.1 Add `CreateExpenseButton` to `Card.Controls` in the expense widget's loading and loaded branches only when
  `useIsCurrentPeriod()` reports the selected month as current.
- [x] 5.2 Verify the trigger remains correctly aligned and available for current-month loading, empty, and populated
  table states and is absent for every non-current period.

## 6. Verification

- [x] 6.1 Run `npm run lint` and resolve every introduced lint issue.
- [x] 6.2 Run `npm run lint:architecture` and resolve every introduced FSD boundary issue.
- [x] 6.3 Run `npm run build` and resolve every introduced TypeScript or production-build issue.
- [x] 6.4 Manually verify current-period trigger visibility; dialog initialization and category states; conditional
  validation; sequential add/remove and quantity controls; automatic, overridden, and zero-reset totals; successful
  refresh of dependent widgets; and failure preservation/retry behavior.
- [x] 6.5 Scope blur validation to the edited field so focusing or leaving one control never reveals errors for untouched
  fields, while attempted submission still validates the complete expense form.
- [x] 6.6 Reset manual amount override when the amount is cleared, and defer empty-category required feedback until the
  form is submitted.
- [x] 6.7 Let TanStack Form's `handleSubmit` own complete submit validation by enabling invalid submission attempts and
  removing the duplicate manual validation pass.
- [x] 6.8 Replace the local calendar-date validator with Zod's built-in ISO date schema while preserving required and
  invalid-date feedback.
- [x] 6.9 Remove the leading plus characters from the `Список` and `Добавить ещё` item-list action labels.
- [x] 6.10 Align category validation coverage and specifications with submit-only required feedback because the selector
  has no clear affordance.
- [x] 6.11 Calculate the automatic amount from item prices only, keep quantity validation and API mapping unchanged,
  update the change artifacts and regression coverage, and verify that quantity edits do not change the amount.
