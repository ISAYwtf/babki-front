import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./password-visibility.ts').catch(() => ({}));

test('maps password visibility to the safe input type and action label', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.getPasswordVisibilityState, 'function');
  assert.deepEqual(model.getPasswordVisibilityState(false), {
    type: 'password',
    labelKey: 'auth.password.show',
  });
  assert.deepEqual(model.getPasswordVisibilityState(true), {
    type: 'text',
    labelKey: 'auth.password.hide',
  });
});
