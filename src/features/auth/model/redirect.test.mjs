import assert from 'node:assert/strict';
import test from 'node:test';

const redirectPromise = import('./session.ts').catch(() => ({}));

test('keeps valid internal redirect paths', async () => {
  const redirect = await redirectPromise;

  assert.equal(typeof redirect.getSafeInternalRedirect, 'function');
  assert.equal(redirect.getSafeInternalRedirect?.('/main'), '/main');
  assert.equal(
    redirect.getSafeInternalRedirect?.('/main?year=2026#expenses'),
    '/main?year=2026#expenses',
  );
});

test('rejects missing and external redirect values', async () => {
  const redirect = await redirectPromise;

  assert.equal(typeof redirect.getSafeInternalRedirect, 'function');
  assert.equal(redirect.getSafeInternalRedirect?.(undefined), null);
  assert.equal(redirect.getSafeInternalRedirect?.(''), null);
  assert.equal(redirect.getSafeInternalRedirect?.('main'), null);
  assert.equal(redirect.getSafeInternalRedirect?.('https://example.com'), null);
  assert.equal(redirect.getSafeInternalRedirect?.('//example.com/main'), null);
  assert.equal(redirect.getSafeInternalRedirect?.('/\\example.com/main'), null);
});

test('rejects malformed and control-character redirect values', async () => {
  const redirect = await redirectPromise;

  assert.equal(typeof redirect.getSafeInternalRedirect, 'function');
  assert.equal(redirect.getSafeInternalRedirect?.('/%E0%A4%A'), null);
  assert.equal(redirect.getSafeInternalRedirect?.('/main\n//example.com'), null);
});
