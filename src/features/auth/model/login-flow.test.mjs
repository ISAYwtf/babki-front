import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./login-flow.ts').catch(() => ({}));

const challenge = {
  requiresTwoFactor: true,
  challengeToken: 'A'.repeat(43),
  expiresAt: '2026-08-16T12:05:00.000Z',
};

test('starts every mounted login flow at credentials without a persisted challenge', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.createLoginFlowState, 'function');
  assert.deepEqual(model.createLoginFlowState?.('/plans'), {
    stage: 'credentials',
    challenge: null,
    redirect: '/plans',
    password: '',
  });
});

test('moves a password challenge to totp and clears the retained password', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.startTwoFactorChallenge, 'function');
  assert.deepEqual(model.startTwoFactorChallenge?.({
    stage: 'credentials',
    challenge: null,
    redirect: '/plans',
    password: 'password',
  }, challenge), {
    stage: 'totp',
    challenge,
    redirect: '/plans',
    password: '',
  });
});

test('switches factor methods without replacing the challenge and blocks switching while pending', async () => {
  const model = await modelPromise;
  const state = model.startTwoFactorChallenge?.(
    model.createLoginFlowState?.('/plans'),
    challenge,
  );

  const recoveryState = model.setLoginFactorMethod?.(state, 'recovery', false);
  assert.equal(recoveryState.stage, 'recovery');
  assert.equal(recoveryState.challenge, challenge);
  assert.equal(model.setLoginFactorMethod?.(recoveryState, 'totp', true), recoveryState);
});

test('restarts credentials with the safe destination but without challenge data', async () => {
  const model = await modelPromise;
  const state = model.startTwoFactorChallenge?.(
    model.createLoginFlowState?.('/plans'),
    challenge,
  );

  assert.deepEqual(model.restartPasswordLogin?.(state), {
    stage: 'credentials',
    challenge: null,
    redirect: '/plans',
    password: '',
  });
});
