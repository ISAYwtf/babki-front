# Current-Period Expense Deletion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show expense deletion actions only when the dashboard's selected month and year match the user's current local calendar month and year.

**Architecture:** The period-selection feature exposes a small `useIsCurrentPeriod(): boolean` hook backed by its existing Zustand store. The `Expenses` widget consumes that public hook and conditionally renders both the trailing action track and `ExpenseActions`, keeping period policy out of the sibling `manage-expense` feature and unmounting any open action UI when the selected period becomes ineligible.

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5, Tailwind CSS 4, TanStack Query 5, Vite 7, OpenSpec.

## Global Constraints

- Deletion is available only when both selected month and selected year match the user's current local calendar month and year.
- When deletion is unavailable, render neither the horizontal-ellipsis trigger nor an action-button skeleton.
- Keep the current-period ellipsis aligned to the right edge of the expense row.
- Do not introduce a dependency from `manage-expense` to `select-period`; period policy belongs in the composing widget.
- Preserve the existing confirmation, mutation, immediate expense-cache update, and related-widget invalidation behavior.
- Do not add dependencies or a test runner.

---

### Task 1: Gate Expense Actions by the Current Calendar Period

**Files:**
- Create: `src/features/select-period/model/is-current-period.ts`
- Create: `src/features/select-period/model/is-current-period.test.ts`
- Modify: `src/features/select-period/model/use-selected-period.ts`
- Modify: `src/features/select-period/index.ts`
- Modify: `src/widgets/expenses/ui/expenses.tsx`
- Modify: `openspec/changes/add-expense-deletion/tasks.md`

**Interfaces:**
- Consumes: `usePeriodStore((state) => state.selectedMonth)` and `usePeriodStore((state) => state.selectedYear)`.
- Produces: `isCurrentPeriod(selectedMonth: number, selectedYear: number, now?: Date): boolean`.
- Produces: `useIsCurrentPeriod(): boolean`, exported from `@/features/select-period`.
- Produces: conditional expense-row and skeleton rendering in which `ExpenseActions` exists only for the current period.

- [ ] **Step 1: Write the failing period-comparison test**

Create `src/features/select-period/model/is-current-period.test.ts`:

```ts
/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
// eslint-disable-next-line import-x/extensions -- Node's TypeScript ESM loader requires the source extension.
import { isCurrentPeriod } from './is-current-period.ts';

const NOW = new Date(2026, 7, 8);

test('accepts the selected local month and year', () => {
  assert.equal(isCurrentPeriod(7, 2026, NOW), true);
});

test('rejects a different selected month', () => {
  assert.equal(isCurrentPeriod(6, 2026, NOW), false);
});

test('rejects the same month from a different year', () => {
  assert.equal(isCurrentPeriod(7, 2025, NOW), false);
});
```

Create a compileable RED scaffold in `src/features/select-period/model/is-current-period.ts`:

```ts
export const isCurrentPeriod = (
  selectedMonth: number,
  selectedYear: number,
  now = new Date(),
) => false;
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
node --test src/features/select-period/model/is-current-period.test.ts
```

Expected: one assertion fails because the current month and year return `false`; the two ineligible-period assertions pass.

- [ ] **Step 3: Implement the minimal period comparison**

Replace the RED scaffold body with:

```ts
export const isCurrentPeriod = (
  selectedMonth: number,
  selectedYear: number,
  now = new Date(),
) => selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
```

- [ ] **Step 4: Run the test to verify GREEN**

Run `node --test src/features/select-period/model/is-current-period.test.ts`.

Expected: all three tests pass.

- [ ] **Step 5: Add the period-availability hook**

Append this hook to `src/features/select-period/model/use-selected-period.ts`:

```ts
export const useIsCurrentPeriod = () => {
  const selectedMonth = usePeriodStore((state) => state.selectedMonth);
  const selectedYear = usePeriodStore((state) => state.selectedYear);

  return isCurrentPeriod(selectedMonth, selectedYear);
};
```

Export it through `src/features/select-period/index.ts` together with `useSelectedPeriod`:

```ts
export {
  useIsCurrentPeriod,
  useSelectedPeriod,
} from './model/use-selected-period';
```

- [ ] **Step 6: Conditionally render the action track and skeleton**

Import both hooks in `src/widgets/expenses/ui/expenses.tsx`, compute `isCurrentPeriod` before the loading return, and select one of two complete static Tailwind class strings so both grid templates are discoverable at build time:

```ts
const selectedPeriod = useSelectedPeriod();
const isCurrentPeriod = useIsCurrentPeriod();
const rowGridClassName = isCurrentPeriod
  ? 'grid grid-cols-[repeat(4,minmax(0,170px))_minmax(48px,1fr)] items-center'
  : 'grid grid-cols-[repeat(4,minmax(0,170px))] items-center';
```

Use `rowGridClassName` for loading and loaded rows. Wrap the loading action cell in `isCurrentPeriod && (...)`. Wrap the loaded action cell and its `ExpenseActions` child in the same condition:

```tsx
{isCurrentPeriod && (
  <Table.Cell
    className="flex justify-end py-5 pr-5 pl-0"
    onClick={(event) => event.stopPropagation()}
  >
    <ExpenseActions transactionId={_id} accountId={accountId} />
  </Table.Cell>
)}
```

This conditional unmount also removes an open menu or confirmation when the selected period becomes unavailable.

- [ ] **Step 7: Run focused static checks**

Run:

```bash
npx eslint src/features/select-period/model/use-selected-period.ts src/features/select-period/index.ts src/widgets/expenses/ui/expenses.tsx
npx tsc -b --pretty false
node --test src/features/select-period/model/is-current-period.test.ts
```

Expected: all three commands exit with status 0.

- [ ] **Step 8: Verify the UI behavior manually**

With `npm run dev` running:

1. Select the current local month and year. Confirm each loaded expense row has one right-aligned horizontal-ellipsis trigger and that its delete confirmation still opens.
2. Select a previous month. Confirm no horizontal-ellipsis trigger is present in loaded rows.
3. Select a different year with the same month number. Confirm no horizontal-ellipsis trigger is present.
4. Reload or throttle the expense request in an ineligible period. Confirm no action-button skeleton appears.
5. Return to the current period and confirm the loading action skeleton and loaded trigger appear when rows exist.
6. Open an action interaction in the current period, switch to an ineligible period if the UI permits it, and confirm the interaction unmounts without starting a new delete request.

- [ ] **Step 9: Run repository validation**

Run:

```bash
npm run lint
npm run lint:architecture
npm run build
npx openspec validate add-expense-deletion --strict
```

Expected: all four commands exit with status 0 and OpenSpec reports `Change 'add-expense-deletion' is valid`.

- [ ] **Step 10: Mark the new OpenSpec work complete**

In `openspec/changes/add-expense-deletion/tasks.md`, mark tasks `3.4`, `3.5`, and `4.6` complete only after their corresponding implementation and manual checks have passed. Re-run:

```bash
npx openspec validate add-expense-deletion --strict
```

Expected: exit status 0.

- [ ] **Step 11: Commit the implementation**

Stage the implementation, the existing expense-deletion feature files, and the updated OpenSpec task state without staging the unrelated `.codex/` directory:

```bash
git add src/entities/balances src/entities/transactions src/features/manage-expense src/features/select-period src/shared/lib/i18n/ru/main.json src/shared/ui/alert-dialog src/widgets/expenses openspec/changes/add-expense-deletion/tasks.md docs/superpowers/plans/2026-08-08-current-period-expense-deletion.md
git commit -m "Added current-period expense deletion"
```

Expected: the commit succeeds on `codex/add-expense-deletion`, and `.codex/` remains untracked.
