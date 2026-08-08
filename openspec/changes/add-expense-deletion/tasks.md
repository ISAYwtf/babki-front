## 1. Entity and Cache Foundations

- [x] 1.1 Rename the unused income-specific transaction deletion payload and hook to transaction-oriented names,
  preserve `DELETE /transactions/:id`, invalidate generic transaction lists, and update the public transaction export.
- [x] 1.2 Export balance query keys through the balance entity so the expense-management feature can invalidate balances
  without using a literal or crossing an internal module boundary.
- [x] 1.3 Add focused expense cache helpers that remove a confirmed identifier only from containing paginated lists,
  decrement each affected `total` once, and leave unrelated cached lists unchanged.
- [x] 1.4 Add post-delete coordination for expense data, reports, limits, balances, generic transactions, and the deleted
  expense account's snapshots, keeping background refetch failure separate from delete-mutation failure.

## 2. Expense Management Feature

- [x] 2.1 Create the `manage-expense` feature structure and public export, accepting only the transaction identifier and
  `accountId` required by the workflow.
- [x] 2.2 Add Russian translations for the actions trigger, delete item, confirmation title and description, cancel,
  confirm, pending, and generic retryable failure states.
- [x] 2.3 Implement the controlled delete confirmation with no request before confirm, disabled close paths while
  pending, retained failure feedback, retry, cancellation, and localized accessible state.
- [x] 2.4 Implement the portal-backed Base UI actions menu with the existing horizontal-dots and cross icons, icon-only
  trigger rendering, a destructive delete item with the visible localized label "Удалить", localized accessible names,
  and standard keyboard behavior.
- [x] 2.5 Connect menu selection, confirmation, the generalized transaction mutation, post-success expense-cache removal,
  parallel dependent invalidation, error reset, and focus restoration without treating refresh failure as delete
  failure.

## 3. Expense Widget Integration

- [x] 3.1 Add a flexible fifth actions track to each loaded expense row, align its fixed-size action to the row's right
  edge, and render the public expense actions feature with that row's identifier and account identifier.
- [x] 3.2 Reserve the same actions track in expense loading skeletons so loaded content does not shift.
- [x] 3.3 Preserve the expanded item-table layout and verify that menu and dialog interactions do not expand or collapse
  expense item details.
- [x] 3.4 Derive whether the selected expense period is the user's current local calendar month without introducing a
  feature-to-feature dependency.
- [x] 3.5 Render loaded-row actions and their loading skeleton only for the current calendar month, removing an open
  action interaction when the user switches to an ineligible period.

## 4. Verification

- [x] 4.1 Run `npm run lint` and resolve all issues introduced by the change.
- [x] 4.2 Run `npm run lint:architecture` and resolve all Feature-Sliced Design violations introduced by the change.
- [x] 4.3 Run `npm run build` and resolve all TypeScript or production-build failures introduced by the change.
- [x] 4.4 Through `npm run dev`, manually verify menu positioning, the visible "Удалить" label, mouse and keyboard
  operation, accessible labels, confirmation cancellation, pending close prevention, focus return, failure retention,
  and retry.
- [x] 4.5 Manually verify that successful deletion immediately updates the expense table, day chart, and category totals,
  then refreshes monthly and yearly reports, limit remainders, balance, transaction data, and account snapshots without
  restoring the row or misreporting a background refetch failure as a deletion failure.
- [x] 4.6 Manually verify that the ellipsis remains right-aligned and operable in the current month, while past and future
  periods render neither the trigger nor its loading skeleton.
