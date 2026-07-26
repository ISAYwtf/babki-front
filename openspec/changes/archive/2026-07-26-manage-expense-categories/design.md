## Context

The frontend already has an `expense-categories` entity with schemas, CRUD API methods, TanStack Query options, and mutation hooks. Category data is consumed by the monthly and annual category widgets, expense rows, expense limits, plan views, and category selectors. The monthly `ExpensesByCategories` widget currently has no management action and renders separate loading, empty, and populated branches.

The change is frontend-only and must follow Feature-Sliced Design. The existing API accepts a category name and optional HEX color, rejects exact duplicate names, and prevents deletion only when a category is linked to an expense. The UI will impose stricter client-side requirements: a non-empty palette color and case-insensitive name uniqueness.

## Goals / Non-Goals

**Goals:**

- Provide category management from the monthly expenses-by-categories widget.
- Support independent inline drafts with per-row creation and update requests.
- Keep unsaved edits isolated from query data and discard them on dialog close.
- Preserve stable row alignment and the bottom position of newly created categories.
- Provide accessible validation, color selection, confirmation, pending, and error states.
- Refresh category consumers that would otherwise retain stale embedded category data.

**Non-Goals:**

- Changing the monthly widget's existing red progress-bar styling.
- Adding management to the annual category widget.
- Changing backend validation, uniqueness, deletion, or referential-integrity rules.
- Supporting arbitrary user-entered colors, category descriptions, archiving, or reordering.
- Introducing a test runner or changing the expense-category API contract.

## Decisions

### Place the workflow in a dedicated feature

Create `src/features/manage-expense-categories` for the trigger, management dialog, editable row, color popover, delete confirmation, local draft helpers, validation, and localized error mapping. The monthly widget imports the public feature API and places the gear trigger in `Card.Controls` in loading, empty, and populated render paths.

This keeps mutations and user interaction above the entity layer while reusing the existing entity API. Putting the workflow in the widget would mix dashboard aggregation with form and mutation responsibilities; putting it in the entity would make the entity depend on feature-specific orchestration.

### Use independent local row drafts

On dialog open, copy query results into a dialog-local `@tanstack/react-form` array and sort a copied array by
`createdAt` ascending. A persisted row tracks its identifier, baseline values, and draft values. TanStack Form
tracks field values and touched state, while row-specific mutation errors remain local to the dialog. At most one
temporary row without an identifier may exist.

A row is dirty when its normalized draft differs from its baseline. Only dirty rows render the save action. The save column is always reserved so other columns do not move. Reverting both fields to their baseline clears dirty state and hides the save action.

On successful update, replace only that row's baseline and draft with the mutation response. On successful creation, replace the temporary row in place with the returned persisted row, preserving its bottom position. On successful deletion, remove only the affected row. Query refetches while the dialog is open do not reconstruct the local list, so they cannot erase unrelated drafts. The next dialog opening initializes from fresh query data.

Alternatives rejected:

- A monolithic list submit lifecycle conflicts with independent row save actions and row-specific API errors; the
  selected shared array form therefore keeps row-level submit orchestration.
- Editing query cache directly would expose unsaved values outside the dialog and require complex rollback behavior.

### Keep dialog close behavior transactional

Closing through the header button, `Escape`, or the backdrop destroys all local drafts without a warning. No query cache is modified until a mutation succeeds.

While a create or update request is pending, the management dialog cannot close and its fields and actions are disabled. While a delete request is pending, the confirmation dialog cannot close. This prevents ambiguous outcomes from requests finishing after their editing surface has disappeared and prevents concurrent mutations from racing with local state reconciliation.

### Validate stricter UI rules in the feature

Use a feature-level form schema rather than tightening the shared entity transport schema. The form requires:

- a trimmed, non-empty name of at most 100 characters;
- a name that is unique among loaded and locally edited rows after trimming and case folding;
- a color selected from the fixed palette.

Duplicate colors remain valid. Validation errors appear after the relevant field is touched. A dirty but invalid row keeps its save action visible and disabled. The outgoing name is trimmed.

The frontend uniqueness check improves immediate feedback but cannot guarantee uniqueness across concurrent clients. Create and update requests interpret the documented `409` response as a duplicate-name conflict, while delete interprets `409` as a linked-expense conflict. This avoids coupling the feature to human-readable backend messages while preserving the draft or confirmation state.

### Use a fixed, accessible color popover

The feature owns a fixed 25-color HEX palette:

```text
#C94F4F #E05D5D #D85B77 #C05A9D #A45DB5
#8B5FC5 #6667C8 #4F7FCF #3D94B8 #2D9C95
#3E9B68 #62A64A #82A93E #A9B63D #D9A321
#E7B43A #E58B3C #D9763E #B86A4B #9A7358
#836F63 #66747F #738A91 #6D8D7B #8B8074
```

The popover renders a 5-by-5 Base UI radio group of 20-pixel circular controls with 10-pixel gaps. The selected color uses both a visual ring and a check indicator. Each option has a localized accessible color name, and Base UI owns roving focus plus arrow-key navigation. Popover collision handling repositions it near viewport edges.

An unselected new row shows an empty color control without assigning a default, ensuring both fields start unfilled as required.

### Use fixed row columns and bounded scrolling

Each row uses a stable grid:

```text
minmax(0, 1fr) | 38px | 32px | 32px
name             color  delete save
```

The error area spans the row below these controls. Invalid controls expose `aria-invalid` and reference the visible row error through `aria-describedby`. Each row is a native form so Enter submits that row while the shared TanStack Form instance continues to own array values and validation. At narrow widths, gaps and control columns may reduce slightly while retaining the four-column order. The dialog is bounded by the viewport; only the category-list region scrolls so the title and add action remain available.

### Separate persisted and temporary deletion

Deleting a temporary row is a local operation with no confirmation. Deleting a persisted row opens a Base UI alert dialog modeled after the existing plan and debt deletion flows.

The confirmation remains open on API failure. A known linked-expense conflict is shown as a localized explanation; unknown failures use the standard mutation-error fallback. On success, the confirmation closes and the row is removed.

### Reconcile dependent query caches after success

Category mutation hooks own all cache reconciliation required by successful category persistence. The update mutation
invalidates the category list together with expense and expense-limit lists because those responses embed category
objects and can otherwise show stale names or colors. It accesses the dependent query keys through entity `@x`
public APIs, following the existing cross-entity invalidation pattern without coupling the UI feature to cache policy.
Create continues to refresh only category-owned cache data. Delete also invalidates expense-limit lists because the
backend currently permits deleting a category that is linked only to a limit, and an active limit cache can otherwise
retain the deleted embedded category. Update continues to invalidate both expense and expense-limit lists.

The feature reconciles only its dialog-local row after mutation success. Invalidation does not rebuild the open
dialog's local rows, and every caller of the update mutation receives the same cache-consistency behavior. The monthly
widget continues to use its existing danger progress variant instead of the category color.

## Risks / Trade-offs

- **Frontend-only case-insensitive uniqueness can race with another client** → Preserve server-conflict handling and the user's draft; no backend change is included.
- **The backend can delete a category referenced only by plans or expense limits** → Document as an existing out-of-scope integrity gap; do not claim the frontend can prevent it reliably.
- **A refetch can complete while unrelated rows are dirty** → Treat local rows as the editing source of truth until the dialog closes.
- **Many categories can exceed the dialog height** → Scroll only the list while keeping header and add action visible.
- **Global mutation locking temporarily prevents editing other rows** → Accept the short lock to avoid concurrent state reconciliation and close races.
- **No automated frontend test runner exists** → Require lint, architecture lint, build, and focused manual verification.

## Migration Plan

1. Add the feature and translations without changing API contracts or persisted data.
2. Integrate the trigger into every render state of the monthly widget.
3. Validate with lint, architecture lint, production build, and manual responsive and keyboard checks.
4. Roll back by removing the widget integration and feature files; no data migration is required.

## Open Questions

None. The backend referential-integrity limitation is explicitly accepted as outside this change.
