import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./two-factor-errors.ts').catch(() => ({}));

test('maps challenge failures without disclosing protected backend state', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.getTwoFactorErrorKey, 'function');
  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 401 } },
    'login',
  ), 'auth.twoFactor.login.errors.invalid');
  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 429 } },
    'login',
  ), 'auth.twoFactor.errors.rateLimited');
  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 500 } },
    'login',
  ), 'auth.errors.generic');
});

test('maps setup conflicts and rollout unavailability separately', async () => {
  const model = await modelPromise;

  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 409 } },
    'setup',
  ), 'auth.twoFactor.setup.errors.enabled');
  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 503 } },
    'setup',
  ), 'auth.twoFactor.setup.errors.unavailable');
  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 401 } },
    'management',
  ), 'auth.twoFactor.management.errors.credentials');
  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 409 } },
    'lifecycle',
  ), 'auth.twoFactor.management.errors.stateChanged');
  assert.equal(model.getTwoFactorErrorKey?.(
    { response: { status: 503 } },
    'lifecycle',
  ), 'auth.twoFactor.management.errors.unavailable');
  assert.equal(model.isTwoFactorStatusConflict?.({ response: { status: 409 } }), true);
  assert.equal(model.isTwoFactorStatusConflict?.({ response: { status: 401 } }), false);
});

test('reads retry-after seconds from plain and Axios-style headers', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.getRetryAfterSeconds, 'function');
  assert.equal(model.getRetryAfterSeconds?.({
    response: { headers: { 'retry-after': '12' } },
  }), 12);
  assert.equal(model.getRetryAfterSeconds?.({
    response: { headers: { get: (name) => (name === 'retry-after' ? '7' : null) } },
  }), 7);
  assert.equal(model.getRetryAfterSeconds?.({ response: { headers: {} } }), 0);
});
