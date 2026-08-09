import assert from 'node:assert/strict';
import test from 'node:test';

const sessionQueryPromise = import('./session-query.ts').catch(() => ({}));

test('does not retry rejected current-user authentication', async () => {
  const sessionQuery = await sessionQueryPromise;

  assert.equal(typeof sessionQuery.shouldRetryCurrentUserQuery, 'function');
  assert.equal(sessionQuery.shouldRetryCurrentUserQuery?.(0, {
    response: { status: 401 },
  }), false);
});

test('retains the existing three-retry limit for non-authentication failures', async () => {
  const sessionQuery = await sessionQueryPromise;
  const serverError = { response: { status: 500 } };

  assert.equal(typeof sessionQuery.shouldRetryCurrentUserQuery, 'function');
  assert.equal(sessionQuery.shouldRetryCurrentUserQuery?.(0, serverError), true);
  assert.equal(sessionQuery.shouldRetryCurrentUserQuery?.(2, serverError), true);
  assert.equal(sessionQuery.shouldRetryCurrentUserQuery?.(3, serverError), false);
});
