import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./auth-form.ts').catch(() => ({}));

const challengeToken = 'A'.repeat(43);
const recoveryCode = '01234-56789-ABCDE-FGHJK-MNPQRS';

test('accepts only the backend two-factor challenge contract', async () => {
  const model = await modelPromise;

  assert.ok(model.twoFactorChallengeResponseSchema, 'twoFactorChallengeResponseSchema must be exported');
  assert.equal(model.twoFactorChallengeResponseSchema.safeParse({
    requiresTwoFactor: true,
    challengeToken,
    expiresAt: '2026-08-16T12:00:00.000Z',
  }).success, true);
  assert.equal(model.twoFactorChallengeResponseSchema.safeParse({
    requiresTwoFactor: true,
    challengeToken: 'A'.repeat(42),
    expiresAt: '2026-08-16T12:00:00.000Z',
  }).success, false);
  assert.equal(model.twoFactorChallengeResponseSchema.safeParse({
    requiresTwoFactor: true,
    challengeToken,
    expiresAt: 'not-a-date',
  }).success, false);
});

test('validates method-specific login codes and normalizes recovery input', async () => {
  const model = await modelPromise;

  assert.ok(model.twoFactorLoginSchema, 'twoFactorLoginSchema must be exported');
  assert.deepEqual(model.twoFactorLoginSchema.parse({
    challengeToken,
    method: 'recovery',
    code: '01234 56789 abcde fghjk mnpqrs',
  }), {
    challengeToken,
    method: 'recovery',
    code: '0123456789ABCDEFGHJKMNPQRS',
  });
  assert.equal(model.twoFactorLoginSchema.safeParse({
    challengeToken,
    method: 'totp',
    code: '12345',
  }).success, false);
  assert.equal(model.twoFactorLoginSchema.safeParse({
    challengeToken,
    method: 'recovery',
    code: '01234-56789-ABCDE-FGHJK-MNPQRU',
  }).success, false);
});

test('validates status and pending setup without accepting management secrets in status', async () => {
  const model = await modelPromise;

  assert.ok(model.twoFactorStatusSchema, 'twoFactorStatusSchema must be exported');
  assert.ok(model.twoFactorSetupResponseSchema, 'twoFactorSetupResponseSchema must be exported');
  assert.deepEqual(model.twoFactorStatusSchema.parse({
    status: 'enabled',
    recoveryCodesRemaining: 7,
    secret: 'must-be-stripped',
  }), {
    status: 'enabled',
    recoveryCodesRemaining: 7,
  });
  assert.equal(model.twoFactorStatusSchema.safeParse({
    status: 'unknown',
    recoveryCodesRemaining: 0,
  }).success, false);
  assert.equal(model.twoFactorSetupResponseSchema.safeParse({
    secret: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    otpauthUri: 'otpauth://totp/Babki:user@example.com?secret=ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    expiresAt: '2026-08-16T12:10:00.000Z',
  }).success, true);
  assert.equal(model.twoFactorSetupResponseSchema.safeParse({
    secret: 'invalid-secret',
    otpauthUri: 'https://example.com/qr',
    expiresAt: '2026-08-16T12:10:00.000Z',
  }).success, false);
});

test('requires ten distinct formatted recovery codes in generation responses', async () => {
  const model = await modelPromise;

  assert.ok(model.recoveryCodesSchema, 'recoveryCodesSchema must be exported');
  const codes = Array.from({ length: 10 }, (_, index) => (
    `${String(index).padStart(5, '0')}-${recoveryCode.slice(6)}`
  ));

  assert.equal(model.recoveryCodesSchema.safeParse(codes).success, true);
  assert.equal(model.recoveryCodesSchema.safeParse(codes.slice(0, 9)).success, false);
  assert.equal(model.recoveryCodesSchema.safeParse([...codes.slice(0, 9), codes[0]]).success, false);
});

test('validates setup, confirmation, regeneration, and disable payloads', async () => {
  const model = await modelPromise;

  assert.ok(model.twoFactorSetupSchema, 'twoFactorSetupSchema must be exported');
  assert.ok(model.confirmTwoFactorSetupSchema, 'confirmTwoFactorSetupSchema must be exported');
  assert.ok(model.regenerateRecoveryCodesSchema, 'regenerateRecoveryCodesSchema must be exported');
  assert.ok(model.disableTwoFactorSchema, 'disableTwoFactorSchema must be exported');
  assert.equal(model.twoFactorSetupSchema.safeParse({ password: 'password' }).success, true);
  assert.equal(model.confirmTwoFactorSetupSchema.safeParse({ token: '123456' }).success, true);
  assert.equal(model.regenerateRecoveryCodesSchema.safeParse({
    password: 'password',
    token: '123456',
  }).success, true);
  assert.deepEqual(model.disableTwoFactorSchema.parse({
    password: 'password',
    method: 'recovery',
    code: recoveryCode,
  }), {
    password: 'password',
    method: 'recovery',
    code: '0123456789ABCDEFGHJKMNPQRS',
  });
});
