import assert from 'node:assert/strict';
import test from 'node:test';

const sessionPromise = import('./unauthorized-session.ts').catch(() => ({}));

test('dispatches one unauthorized callback for concurrent failures from the same token', async () => {
  const session = await sessionPromise;
  let invalidationCount = 0;

  assert.equal(typeof session.setUnauthorizedSessionHandler, 'function');
  assert.equal(typeof session.handleUnauthorizedSession, 'function');
  session.setUnauthorizedSessionHandler?.(() => {
    invalidationCount += 1;
  });

  const rejectedRequest = {
    status: 401,
    url: '/expenses',
    authorization: 'Bearer rejected-token',
  };
  assert.equal(session.handleUnauthorizedSession?.(rejectedRequest), true);
  assert.equal(session.handleUnauthorizedSession?.(rejectedRequest), false);
  assert.equal(invalidationCount, 1);

  assert.equal(session.handleUnauthorizedSession?.({
    ...rejectedRequest,
    authorization: 'Bearer next-token',
  }), true);
  assert.equal(invalidationCount, 2);
});

test('does not invalidate a session for public auth failures or requests without a bearer token', async () => {
  const session = await sessionPromise;
  let invalidationCount = 0;

  assert.equal(typeof session.setUnauthorizedSessionHandler, 'function');
  assert.equal(typeof session.handleUnauthorizedSession, 'function');
  session.setUnauthorizedSessionHandler?.(() => {
    invalidationCount += 1;
  });

  assert.equal(session.handleUnauthorizedSession?.({
    status: 401,
    url: '/auth/login',
    authorization: 'Bearer stale-token',
  }), false);
  assert.equal(session.handleUnauthorizedSession?.({
    status: 401,
    url: '/auth/register?source=web',
    authorization: 'Bearer stale-token',
  }), false);
  assert.equal(session.handleUnauthorizedSession?.({
    status: 401,
    url: '/expenses',
  }), false);
  assert.equal(session.handleUnauthorizedSession?.({
    status: 403,
    url: '/expenses',
    authorization: 'Bearer stale-token',
  }), false);
  assert.equal(invalidationCount, 0);
});

test('allows the same bearer token to start a later authenticated session after reset', async () => {
  const session = await sessionPromise;
  let invalidationCount = 0;

  assert.equal(typeof session.resetUnauthorizedSessionHandling, 'function');
  session.setUnauthorizedSessionHandler?.(() => {
    invalidationCount += 1;
  });

  const rejectedRequest = {
    status: 401,
    url: '/expenses',
    authorization: 'Bearer reusable-token',
  };
  session.handleUnauthorizedSession?.(rejectedRequest);
  session.resetUnauthorizedSessionHandling?.();
  session.handleUnauthorizedSession?.(rejectedRequest);

  assert.equal(invalidationCount, 2);
});
