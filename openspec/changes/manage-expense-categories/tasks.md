## 1. Feature Model and Localization

- [x] 1.1 Create the `manage-expense-categories` feature structure and public export without changing the existing entity API contract.
- [x] 1.2 Define the 25-color palette, localized accessible color names, row draft types, normalization helpers, dirty-state calculation, and oldest-to-newest initialization.
- [x] 1.3 Implement feature-level row validation for trimmed required names, the 100-character limit, case-insensitive uniqueness across local rows, and required palette colors.
- [x] 1.4 Add Russian translations for the dialog, actions, color names, validation feedback, pending labels, deletion confirmation, linked-expense conflict, and generic errors.

## 2. Category Management UI

- [x] 2.1 Implement the accessible color popover as a 5-by-5 grid of 20-pixel circles with 10-pixel gaps, selected ring/check state, keyboard support, and collision-aware positioning.
- [x] 2.2 Implement the editable category row with stable name, color, delete, and reserved save columns plus touched-field and mutation-error presentation.
- [x] 2.3 Implement the persisted-category deletion confirmation by following the existing plan/debt dialog pattern, including pending close prevention and API error retention.
- [x] 2.4 Implement the main "Категории" dialog with bounded list scrolling, empty state, one bottom temporary row, disabled add action while that row exists, and discard-on-close behavior.
- [x] 2.5 Connect create, update, and delete mutations so successful responses reconcile only the affected local row and failed requests preserve all drafts.
- [x] 2.6 Add global mutation locking for the relevant dialog, map duplicate and linked-expense conflicts, and invalidate category plus stale embedded expense and expense-limit query data after success.

## 3. Widget Integration

- [x] 3.1 Implement the gear trigger with accessible labeling and wire it to the management dialog.
- [x] 3.2 Add the trigger to the monthly expenses-by-categories widget header in loading, empty, and populated states without changing the annual widget.
- [x] 3.3 Confirm the monthly widget retains its existing danger progress variant after category color changes.

## 4. Verification

- [x] 4.1 Run `npm run lint` and resolve all issues introduced by the change.
- [x] 4.2 Run `npm run lint:architecture` and resolve all Feature-Sliced Design violations introduced by the change.
- [x] 4.3 Run `npm run build` and resolve all TypeScript or production-build failures introduced by the change.
- [x] 4.4 Manually verify creation, single-temporary-row enforcement, independent edits, validation, successful and failed mutations, confirmation, pending locks, cache refresh, and discard-on-close behavior through `npm run dev`.
- [x] 4.5 Manually verify keyboard operation, accessible labels/states, palette collision handling, stable row alignment, list scrolling, and approximately 320-pixel responsive layout.

## 5. Form State Refactor

- [x] 5.1 Refactor category field, touched, validation, add, and remove state to `@tanstack/react-form`
  while preserving independent row saves, mutation errors, pending locks, and discard-on-close behavior.

## 6. Cache Responsibility Refactor

- [x] 6.1 Expose expense and expense-limit query keys through category-specific entity `@x` APIs, move dependent
  list invalidation into the expense-category update mutation hook, and remove cache orchestration from the UI feature.
- [x] 6.2 Run `npm run lint`, `npm run lint:architecture`, and `npm run build` after the cache refactor.

## 7. Review Corrections

- [x] 7.1 Replace the hand-written color `role="radio"` controls with Base UI `RadioGroup` and `Radio`, preserving
  the 5-by-5 layout, localized labels, selection styling, close-on-select behavior, and popover collision handling.
- [x] 7.2 Associate row validation messages with invalid controls through stable ids, `aria-invalid`, and
  `aria-describedby`, and make Enter submit only the focused category row.
- [x] 7.3 Use Base UI `AlertDialog` for persisted deletion and narrow its props to mutation state and callbacks.
- [x] 7.4 Remove human-readable response-message matching, interpret operation-specific `409` conflicts, invalidate
  expense-limit lists after successful deletion, and remove redundant mutation/reset branches.
- [x] 7.5 Extract TanStack Form row field binding from the main dialog component while retaining the custom baseline
  and independent row-save orchestration required by the specification.
- [x] 7.6 Run `npm run lint`, `npm run lint:architecture`, and `npm run build`, then manually verify keyboard,
  accessibility, deletion, cache, and independent draft scenarios.
