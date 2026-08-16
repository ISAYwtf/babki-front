import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./session-response.ts').catch(() => ({}));

const authResponse = {
  accessToken: 'replacement-token',
  user: { _id: 'user-id', email: 'user@example.com' },
};

test('clears prior query data before establishing a different identity', async () => {
  const model = await modelPromise;
  const events = [];

  assert.equal(typeof model.establishAuthSession, 'function');
  model.establishAuthSession?.(authResponse, {
    clearQueryData: () => events.push('clear'),
    setAccessToken: (token) => events.push(`token:${token}`),
    resetUnauthorizedHandling: () => events.push('reset'),
    setCurrentUser: (user) => events.push(`user:${user._id}`),
  }, 'identity-change');

  assert.deepEqual(events, [
    'clear',
    'token:replacement-token',
    'reset',
    'user:user-id',
  ]);
});

test('replaces a same-user session without clearing finance query data', async () => {
  const model = await modelPromise;
  const events = [];

  model.establishAuthSession?.(authResponse, {
    clearQueryData: () => events.push('clear'),
    setAccessToken: (token) => events.push(`token:${token}`),
    resetUnauthorizedHandling: () => events.push('reset'),
    setCurrentUser: (user) => events.push(`user:${user._id}`),
  }, 'same-user');

  assert.deepEqual(events, [
    'token:replacement-token',
    'reset',
    'user:user-id',
  ]);
});
