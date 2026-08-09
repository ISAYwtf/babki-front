import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./expense-list-cache.ts').catch(() => ({}));

const originalExpense = {
  _id: 'expense-1',
  amount: 100,
  description: 'Старое значение',
};

const updatedExpense = {
  ...originalExpense,
  amount: 150,
  description: 'Новое значение',
};

test('replaces a matching expense without changing pagination metadata', async () => {
  const model = await modelPromise;
  const response = {
    items: [originalExpense, { _id: 'expense-2', amount: 20 }],
    total: 2,
    page: 1,
    limit: 20,
  };

  assert.equal(typeof model.replaceExpenseInPaginatedResponse, 'function');
  assert.deepEqual(
    model.replaceExpenseInPaginatedResponse?.(response, updatedExpense),
    {
      ...response,
      items: [updatedExpense, response.items[1]],
    },
  );
});

test('preserves an unrelated cached response by reference', async () => {
  const model = await modelPromise;
  const response = {
    items: [{ _id: 'expense-2', amount: 20 }],
    total: 1,
    page: 1,
    limit: 20,
  };

  assert.equal(
    model.replaceExpenseInPaginatedResponse?.(response, updatedExpense),
    response,
  );
});
