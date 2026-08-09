import assert from 'node:assert/strict';
import test from 'node:test';

const sessionPromise = import('./session.ts').catch(() => ({}));

test('clears token and cached identity before navigating to a safe login redirect', async () => {
  const session = await sessionPromise;
  const state = {
    token: 'stored-token',
    cache: ['current-user', 'expenses'],
    navigation: null,
  };

  assert.equal(typeof session.endSession, 'function');
  session.endSession?.({
    clearToken: () => {
      state.token = null;
    },
    clearCache: () => {
      state.cache = [];
    },
    navigateToLogin: (redirect) => {
      state.navigation = { redirect, replace: true };
    },
  }, '/main?year=2026');

  assert.deepEqual(state, {
    token: null,
    cache: [],
    navigation: { redirect: '/main?year=2026', replace: true },
  });
});

test('drops an unsafe redirect while ending the session', async () => {
  const session = await sessionPromise;
  let navigation = 'not-called';

  assert.equal(typeof session.endSession, 'function');
  session.endSession?.({
    clearToken: () => {},
    clearCache: () => {},
    navigateToLogin: (redirect) => {
      navigation = redirect;
    },
  }, '//example.com');

  assert.equal(navigation, null);
});
