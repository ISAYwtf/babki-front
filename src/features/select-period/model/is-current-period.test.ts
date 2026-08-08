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
