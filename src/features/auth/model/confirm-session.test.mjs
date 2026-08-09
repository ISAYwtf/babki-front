import assert from 'node:assert/strict';
import test from 'node:test';

const sessionPromise = import('./confirm-session.ts').catch(() => ({}));

test('does not load the current user when no access token exists', async () => {
  const session = await sessionPromise;
  let loadCount = 0;

  assert.equal(typeof session.confirmSession, 'function');
  assert.equal(await session.confirmSession?.(null, async () => {
    loadCount += 1;
    return { email: 'user@example.ru' };
  }), false);
  assert.equal(loadCount, 0);
});

test('confirms only a successfully loaded current user', async () => {
  const session = await sessionPromise;

  assert.equal(typeof session.confirmSession, 'function');
  assert.equal(await session.confirmSession?.('token', async () => ({
    email: 'user@example.ru',
  })), true);
  assert.equal(await session.confirmSession?.('token', async () => null), false);
  assert.equal(await session.confirmSession?.('token', async () => {
    throw new Error('request failed');
  }), false);
});
