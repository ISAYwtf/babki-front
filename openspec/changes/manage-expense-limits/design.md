## Context

The frontend already has an `expense-limits` entity with Zod transport schemas, CRUD API methods, TanStack Query
options, and mutation hooks. The monthly `ExpenseLimits` widget queries limits with a `periodDate` derived from the
selected dashboard month and renders category progress, but it has no management entry point. Expense categories
already expose a reusable badge, category selector, list query, and a complete inline management feature whose local
draft behavior is a useful reference.

The change is frontend-only and must preserve Feature-Sliced Design. In particular, a new feature cannot import the
existing `select-period` feature directly. The backend create contract accepts `categoryId`, `total`, and optional
`startDate`/`endDate`; update accepts only `total`. Persisted limit categories therefore cannot be changed through the
current API.

## Goals / Non-Goals

**Goals:**

- Provide expense-limit management from the monthly limit widget for the selected calendar month.
- Support independent inline creation and amount-editing drafts with per-row save actions.
- Keep persisted categories immutable and prevent duplicate category limits within the selected month.
- Discard unsaved dialog-local values on close without mutating query data.
- Provide accessible validation, confirmation, pending, loading, and error states.
- Refresh monthly progress after successful mutations without overwriting unrelated open drafts.

**Non-Goals:**

- Changing the expense-limit backend contract or allowing a persisted limit's category to be updated.
- Managing limits across multiple months in one dialog.
- Supporting overlapping custom date ranges, recurrence rules, copying limits between months, or bulk operations.
- Refactoring category and limit management into a generic row-editor framework.
- Introducing a test runner or changing the existing widget progress calculation and styling.

## Decisions

### Place orchestration in a dedicated feature

Create `src/features/manage-expense-limits` for the trigger, dialog, editable rows, deletion confirmation, local draft
helpers, validation, and localized error mapping. `ExpenseLimits` places the public feature component in
`Card.Controls` in both its loading return and its populated/empty render path.

The widget passes the selected `periodDate` to the feature. This keeps period selection in the widget layer, which may
compose multiple features, and avoids an invalid feature-to-feature import. The feature can issue the same
expense-limit query as the widget; TanStack Query shares the cache and request by query key.

Putting the workflow inside the widget was rejected because it would mix progress presentation with form,
confirmation, and mutation orchestration. Generalizing category and limit management was rejected because their
editable fields and API contracts differ enough that a shared editor would add indirection without a stable common
domain abstraction.

### Treat the selected calendar month as the management boundary

The feature queries limits with the `periodDate` received from the widget. For creation, it derives the first and last
calendar day of that date's month and sends them as `startDate` and `endDate`. This deliberately does not reuse
`useSelectedPeriod().toDate` as the end date because the current month uses today's date for report queries rather
than the calendar month's final day.

The dialog's period is fixed by its trigger props while open. Underlying month controls are inaccessible behind the
modal, so drafts cannot silently move between periods. Past, current, and future months use the same full-month
boundary rule.

### Use independent local drafts initialized once per opening

On open, copy the selected month's query result into a dialog-local TanStack Form array while preserving API order.
The expense-limit response has no creation timestamp, so the client does not invent an age-based ordering. Each
persisted draft stores a stable key, limit identifier, immutable category data, baseline total, and draft total string.
A temporary draft stores a stable local key, an empty `categoryId`, an empty total, and no baseline.

Query refetches while the dialog is open do not reconstruct the array. Successful mutation responses reconcile only
the affected row:

- update replaces the row's total and baseline;
- create replaces the temporary row in place with a persisted draft;
- delete removes the persisted row.

This preserves unrelated unsaved drafts. Closing an idle dialog through its close action, backdrop, or Escape resets
the form, mutation errors, confirmation target, and initialization flag. The next opening initializes from current
query data.

Amount dirty state is based on numeric equivalence after both baseline and draft have valid numeric representations.
Consequently, formatting-only changes such as `100` to `100.00` do not expose a save action. An invalid changed value
remains dirty so the disabled save action and validation feedback stay visible.

### Keep categories immutable after persistence and unique within the month

A persisted row renders its embedded category as `ExpenseCategoryBadge`; it does not render a category selector.
Only the temporary row uses `CategorySelect`.

The available options are loaded expense categories whose identifiers are not used by any persisted or local draft in
the dialog. This makes one limit per category per month explicit before submission. The add action is disabled when a
temporary row already exists, no unused category remains, required data has not loaded, or a mutation is pending.

Client-side filtering cannot prevent a concurrent client from creating the same category limit. A server conflict
from create is therefore mapped back to the temporary category field while retaining the draft.

### Validate monetary input in the feature

Keep transport schemas aligned with the existing backend contract and place UI-specific validation in the feature.
The draft total is a string so empty and partially entered values can be represented. A valid amount:

- is non-empty;
- converts to a finite number;
- is at least `0.01`;
- contains no more than two decimal places.

The submitted payload converts the validated string to a number. The temporary row additionally requires an unused
category identifier. Validation messages are shown after field interaction or an attempted save. A dirty invalid row
keeps its save action visible but disabled.

### Serialize mutations and keep close behavior deterministic

Use the existing create, update, and delete mutation hooks, but permit only one outstanding dialog mutation. While any
request is pending, all management fields and actions are disabled and the main dialog cannot close. While deletion is
pending, the confirmation also cannot close.

This global lock is slightly more restrictive than row-only pending state, but it avoids races between concurrent
responses, local row indices, query invalidation, and dialog teardown. The affected save action displays a spinner and
an accessible pending label.

Generic create and update failures are attached to the affected row and preserve its values. Changing the relevant
field clears that row's server error. An initial limit-loading failure prevents list initialization and all mutations.
A category-loading failure is displayed but disables only creation; persisted limits already contain embedded category
data and remain editable and deletable.

### Confirm persisted deletion

Deleting a temporary row is a local operation without confirmation or an API call. Deleting a persisted row opens an
alert dialog titled "Удалить лимит?" with confirm and cancel actions.

On success, remove the row and close the confirmation. On failure, leave both the confirmation and row intact and show
the deletion error. This follows the established category-management pattern and protects against accidental
destructive actions.

### Use stable columns and bounded scrolling

Rows reserve four columns in this order:

```text
category | amount | delete | save
```

The category and amount tracks may shrink while delete and save keep fixed icon-button widths. Persisted categories use
a badge in the category track; the temporary row uses the category select. The save track is always reserved, so
showing or hiding the action does not shift other controls. A row error spans all columns below the controls.

The dialog is bounded by the dynamic viewport. Only the list region scrolls; the header and "Добавить лимит" action
remain available. At approximately 320 pixels viewport width, tracks shrink without horizontal clipping. Icon-only
controls expose localized accessible labels, invalid controls expose programmatic state, and Enter in a valid dirty
amount submits only its row.

### Reuse expense-limit query invalidation

The existing expense-limit mutations invalidate list data after successful create, update, and delete operations. The
feature relies on that entity-owned cache policy so the widget refreshes its progress. The open dialog continues to use
its local array as the editing source of truth, preventing an invalidation refetch from erasing unrelated drafts.

The mutation endpoints can return a representation that does not satisfy the full expense-limit read schema even
though persistence succeeds. Entity mutation functions therefore try to recover a full entity only when parsing the
mutation response returns `null`: create reads the selected period and finds its unique `categoryId`, while update
reads the known limit detail. A failed recovery read does not turn the confirmed write into a failed mutation or skip
list invalidation. In that exceptional case, the feature commits an update from its submitted total or converts a
confirmed create into a non-editable local row that continues reserving its category across dialog reopenings. The
placeholder is reconciled with the complete server entity when an invalidated list read eventually returns it, avoiding
duplicate retries without overwriting unrelated drafts.

## Risks / Trade-offs

- **A concurrent client creates the same category limit** → Preserve the local draft and map the server conflict to the
  category field.
- **The API interprets date boundaries differently from calendar dates** → Send existing date-only schema values for
  the exact first and last day and manually verify past, current, and future periods.
- **Query data changes while the dialog contains drafts** → Do not reinitialize until the dialog has closed and opened
  again.
- **Global mutation locking reduces parallel editing during a request** → Accept the short lock for deterministic local
  reconciliation and close behavior.
- **A narrow dialog has two flexible data fields plus two actions** → Use shrinking tracks, compact gaps, and bounded
  error text; verify at approximately 320 pixels.
- **No automated UI test runner exists** → Require lint, architecture lint, build, and focused manual keyboard,
  responsive, failure, and cache-refresh checks.

## Migration Plan

1. Add the feature, local validation, and translations without changing persisted data or API routes.
2. Integrate its trigger into every render state of the monthly expense-limit widget.
3. Validate lint, Feature-Sliced architecture, production build, and the manual scenario matrix.
4. Roll back by removing the widget integration and feature files; no data migration is required.

## Open Questions

None.
