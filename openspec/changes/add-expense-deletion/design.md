## Context

The dashboard renders monthly expenses in `src/widgets/expenses` from `expensesQueryOptions.findAll`. The same expense
data drives the day chart and category breakdown, while reports, expense limits, balances, and account snapshots use
separate server-backed query families. The table currently has four data columns and an accordion trigger for item
details, but no row actions.

The frontend already provides the required primitives: horizontal-dots and cross icons, an icon button, Base UI
`Menu`, and a shared `AlertDialog`. The backend already deletes the underlying transaction through
`DELETE /transactions/:id`. A transaction deletion hook exists under the misleading name `useDeleteIncomeMutation`,
is not used anywhere, and invalidates only transaction-list queries. The change is therefore frontend-only but must
coordinate several independent caches and preserve Feature-Sliced Design import direction.

## Goals / Non-Goals

**Goals:**

- Add an accessible actions menu with an icon-only trigger at the right edge of expense rows in the current calendar
  month and a visibly labeled delete item.
- Omit the actions trigger entirely when the selected dashboard period is not the current calendar month.
- Require explicit confirmation before deleting the underlying expense transaction.
- Keep the row and dialog intact on failure so deletion can be retried safely.
- Reflect a confirmed deletion immediately in expense-list-derived widgets and refresh every related server aggregate.
- Keep menu, dialog, mutation, cache, focus, and error orchestration isolated in a dedicated feature.

**Non-Goals:**

- Adding edit, duplicate, bulk-delete, undo, or multi-select actions.
- Changing the transaction delete endpoint, expense schemas, or persisted data.
- Reopening a plan whose execution originally created the deleted expense.
- Introducing optimistic deletion before the server confirms success.
- Adding a test runner, generic row-action framework, tooltip system, or backend changes.

## Decisions

### Place row-action orchestration in `manage-expense`

Create a dedicated `src/features/manage-expense` slice with a public expense-actions component, an ellipsis-triggered
menu, a delete confirmation dialog, and focused error/cache helpers. The `Expenses` widget passes only the expense
identifier and `accountId`; the feature owns open state, pending state, confirmation, deletion, refresh, and focus
restoration.

This keeps the widget responsible for expense presentation and lets the menu grow with future expense operations
without enlarging the table component. Implementing the workflow directly in the widget was rejected because it would
mix display, destructive interaction, and cross-entity cache policy. Putting the UI in an entity was rejected because
confirmation and user-triggered orchestration belong in the feature layer.

### Use a trailing flexible actions track

Change each main expense-row grid from four equal data tracks to four existing bounded tracks followed by one flexible
actions track. The track consumes all remaining row width while the fixed-size dots trigger is aligned to its right
edge with the standard cell padding. Loading rows reserve the same layout so the content does not shift when data
arrives. Expanded item tables remain below the main row and do not gain an actions column.

Menu and dialog controls stop their own interaction from affecting the expense accordion. The existing description
trigger remains the only way to expand or collapse item details.

### Gate actions by the selected calendar period in the widget

Determine action availability in the `Expenses` widget by comparing the selected month and year with the user's
current local calendar month and year. When they match, render the trailing actions track and `ExpenseActions` exactly
as designed. When they do not match, render neither the actions component nor an actions skeleton, because deletion is
the only available row operation and the trigger must not represent an empty menu.

Keep this policy in the widget rather than importing period-selection state into `manage-expense`. Both modules are in
the feature/widget composition path, and the widget already owns the selected period used for the expense query. If
the user changes away from the current month while an action menu or confirmation is open, conditional unmounting
removes that interaction immediately. The existing post-delete cache updates and aggregate invalidations remain
unchanged for allowed deletions.

### Reuse Base UI and existing shared assets

Build the popup with Base UI `Menu` and render it through a portal so table overflow cannot clip it. Use the existing
`IcDots20` trigger icon and `IcCross24` delete icon. The trigger remains icon-only and receives a localized `aria-label`.
The delete item combines the red cross with the visible localized label "Удалить" and also exposes an accessible name.
The delete item and its hover/focus states use destructive color.

Selecting delete closes the menu before opening the controlled shared `AlertDialog`. The dialog uses the established
Russian confirmation pattern: title "Удалить расход?", irreversible-action description, cancel, delete, and deleting
labels. A ref to the dots trigger restores focus after cancellation, failure dismissal, or successful completion.

### Generalize the transaction deletion mutation

Rename the unused `useDeleteIncomeMutation` and its payload type to transaction-oriented names. Continue calling the
existing transaction API and invalidating generic transaction-list queries. The feature composes this entity mutation
with expense-specific success behavior rather than teaching the transaction entity about reports, limits, or balance.

No compatibility alias is needed because the current hook has no consumers. The endpoint and request payload remain
unchanged.

### Update expense data only after server confirmation

Do not remove or dim a row before the delete request succeeds. While the request is pending, keep the dialog open,
disable confirm and cancel controls, reject backdrop/Escape close attempts, and expose the pending label.

After the server confirms deletion, update every cached paginated expense list that contains the identifier: filter the
item from `items` and decrement `total` exactly once for that list. Remove the matching expense-detail cache and close
the dialog. This post-success cache update makes the table, expense-by-day chart, and category aggregation react
immediately without risking an optimistic rollback.

An affected cached page can temporarily contain one fewer item than its `limit`; the authoritative refetch fills the
page and corrects pagination metadata.

### Refresh all related query families in parallel

Immediately after the confirmed local cache update, invalidate active data for:

- expense lists and details;
- generic transaction lists;
- monthly and yearly reports;
- expense limits;
- balances;
- account snapshots for the deleted expense's `accountId`.

Expose balance query keys through the balance entity's public API, matching the query-key exports already provided by
the other entities. The feature may import these public entity contracts because the FSD direction is
`features -> entities`.

Run the invalidations concurrently. They begin after a successful delete and are not part of deciding whether the
delete itself succeeded. A later refetch failure therefore stays query-owned and MUST NOT reopen the dialog or present
the completed deletion as retryable; retrying the delete could otherwise send a second request for a missing resource.

### Keep deletion failure recoverable in the confirmation

If the delete request fails, leave both the expense cache and visible row unchanged. Keep the confirmation open, render
a localized generic error with `role="alert"`, clear the pending lock, and allow confirm or cancel again. Do not expose
raw backend error text. A retry sends one new delete request for the same transaction identifier.

Closing an idle confirmation clears its error. During a request, the controlled dialog ignores close requests so local
state cannot outlive an in-flight destructive action.

## Risks / Trade-offs

- **A cached expense page becomes temporarily underfilled** → Decrement it only when it contains the deleted item and
  immediately refetch expense queries to restore authoritative pagination.
- **Broad invalidation causes multiple requests** → Run query families in parallel and accept the bounded cost because
  deletion changes all visible financial aggregates and correctness is more important than avoiding these refetches.
- **A refetch fails after deletion succeeded** → Keep deletion completion separate from refresh status and let each
  query retain its normal error/retry behavior.
- **A destructive icon can be misunderstood** → Pair the red cross with the visible localized label "Удалить" while
  preserving menu semantics, keyboard operation, focus styling, destructive color, and accessible names.
- **A menu interaction accidentally affects row expansion** → Keep expansion bound to its existing trigger and verify
  menu/dialog events do not toggle the accordion.
- **The selected month has no available row actions** → Do not render an empty actions trigger or its loading skeleton;
  compare both month and year so the same month name in another year is not treated as current.
- **No automated UI tests exist** → Require lint, architecture lint, production build, and a focused manual matrix for
  success, failure, pending, keyboard, focus, overflow, and cache refresh behavior.

## Migration Plan

1. Generalize the existing unused transaction deletion hook and expose required query keys.
2. Add the feature, translations, menu, confirmation, and post-success cache coordination.
3. Integrate the actions component and trailing track into eligible loaded and loading expense rows, gated by the
   selected current calendar month.
4. Run static validation and manually verify the full success, failure, accessibility, and refresh matrix.
5. Roll back by removing the widget integration and feature and restoring the hook name/exports; no data migration is
   required.

## Open Questions

None.
