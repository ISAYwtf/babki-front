## 1. Feature Model and Localization

- [x] 1.1 Create the `manage-expense-limits` feature structure and public export without changing the existing
  expense-limit API contract.
- [x] 1.2 Define persisted and temporary row drafts, full-calendar-month boundary helpers, API-order initialization,
  and numeric dirty-state comparison.
- [x] 1.3 Implement TanStack Form validation for required unused categories and amounts that are finite, at least
  `0.01`, and limited to two decimal places.
- [x] 1.4 Add Russian translations for the dialog, fields, actions, accessible labels, validation, loading, pending,
  duplicate conflict, deletion confirmation, and generic errors.

## 2. Limit Management UI

- [x] 2.1 Implement the limit row with a persisted category badge or temporary category selector, amount input,
  delete action, reserved save column, touched validation, row mutation errors, and Enter submission.
- [x] 2.2 Implement persisted-limit deletion confirmation with cancel, pending close prevention, success removal, and
  retained failure feedback; keep temporary-row deletion local and immediate.
- [x] 2.3 Implement the main "Лимиты" dialog with accessible loading and failure states, bounded list scrolling,
  "Пока пусто", one bottom temporary row, unused-category enforcement, and disabled add behavior.
- [x] 2.4 Implement discard-on-close initialization and reset behavior so query refetches cannot overwrite open
  drafts and the next opening uses current query data.
- [x] 2.5 Connect create, update, and delete mutations with global mutation locking, per-row reconciliation, full-month
  create dates, total-only updates, duplicate-conflict mapping, and preserved failed drafts.
- [x] 2.6 Keep expense-limit query invalidation and nullable mutation-response recovery in the entity layer so a
  confirmed write refreshes the monthly widget without being reported as failed when its recovery read is unavailable.

## 3. Widget Integration

- [x] 3.1 Implement the accessible gear trigger and pass the widget's selected `periodDate` into the management
  feature without introducing a feature-to-feature import.
- [x] 3.2 Add the trigger to the expense-limits widget header in loading, empty, and populated states while preserving
  existing progress and empty-state behavior.

## 4. Verification

- [x] 4.1 Run `npm run lint` and resolve all issues introduced by the change.
- [x] 4.2 Run `npm run lint:architecture` and resolve all Feature-Sliced Design violations introduced by the change.
- [x] 4.3 Run `npm run build` and resolve all TypeScript or production-build failures introduced by the change.
- [x] 4.4 Through `npm run dev`, manually verify past, current, and future month boundaries; empty and populated
  states; one-temporary-row and unused-category enforcement; amount validation; numeric dirty/revert behavior;
  independent saves; failed draft retention; deletion confirmation; pending locks; cache refresh; and discard on every
  close path.
- [x] 4.5 Manually verify keyboard operation, Enter row submission, accessible labels and states, long-list scrolling,
  stable row alignment, and an approximately 320-pixel viewport without horizontal clipping.
