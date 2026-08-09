import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./auth-form.ts').catch(() => ({}));

test('requires a non-empty authentication access token', async () => {
  const model = await modelPromise;

  assert.ok(model.authAccessTokenSchema, 'authAccessTokenSchema must be exported');
  assert.equal(model.authAccessTokenSchema.safeParse('').success, false);
  assert.equal(model.authAccessTokenSchema.safeParse('   ').success, false);
  assert.equal(model.authAccessTokenSchema.safeParse('token').success, true);
});
