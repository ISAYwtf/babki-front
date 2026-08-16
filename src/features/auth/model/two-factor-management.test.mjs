import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./two-factor-management.ts').catch(() => ({}));

const setup = {
  secret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
  otpauthUri: 'otpauth://totp/Babki:user?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
  expiresAt: '2026-08-16T12:05:00.000Z',
};

test('represents loading, error, and every backend status without guessing', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.createTwoFactorManagementState, 'function');
  assert.deepEqual(model.createTwoFactorManagementState?.(), {
    view: 'loading',
    provisioning: null,
    recoveryCodes: null,
  });
  assert.equal(model.showManagementError?.().view, 'error');
  assert.equal(model.showTwoFactorStatus?.({ status: 'disabled', recoveryCodesRemaining: 0 }).view, 'disabled');
  assert.equal(model.showTwoFactorStatus?.({ status: 'pending', recoveryCodesRemaining: 0 }).view, 'pending');
  assert.deepEqual(model.getTwoFactorStatusAfterSetup?.(), {
    status: 'pending',
    recoveryCodesRemaining: 0,
  });
  assert.deepEqual(
    model.showTwoFactorStatus?.({ status: 'enabled', recoveryCodesRemaining: 7 }),
    {
      view: 'enabled', provisioning: null, recoveryCodes: null, recoveryCodesRemaining: 7,
    },
  );
});

test('moves through setup and confirmation while keeping provisioning only in memory', async () => {
  const model = await modelPromise;

  assert.equal(model.startSetupAuthorization?.().view, 'setup');
  assert.deepEqual(model.showProvisioning?.(setup), {
    view: 'confirmation',
    provisioning: setup,
    recoveryCodes: null,
  });
  assert.deepEqual(model.restartSetup?.(), {
    view: 'setup',
    provisioning: null,
    recoveryCodes: null,
  });
  assert.deepEqual(model.expireProvisioning?.(), {
    view: 'pending',
    provisioning: null,
    recoveryCodes: null,
  });
});

test('represents recovery display, regeneration, and disabling states', async () => {
  const model = await modelPromise;
  const codes = Array.from({ length: 10 }, (_, index) => `CODE${index}`);

  assert.equal(model.startRecoveryRegeneration?.(6).view, 'regeneration');
  assert.equal(model.startDisable?.(6).view, 'disable');
  assert.deepEqual(model.showRecoveryCodes?.(codes), {
    view: 'recovery',
    provisioning: null,
    recoveryCodes: codes,
  });
});

test('closing or returning to status clears plaintext factor material', async () => {
  const model = await modelPromise;

  assert.deepEqual(model.clearTwoFactorSecrets?.({
    view: 'recovery',
    provisioning: setup,
    recoveryCodes: ['secret-code'],
  }), {
    provisioning: null,
    recoveryCodes: null,
  });
});

test('keeps the active view until the dialog close transition completes', async () => {
  const model = await modelPromise;
  const recoveryState = model.showRecoveryCodes?.(['secret-code']);

  assert.equal(model.canDismissTwoFactorManagement?.(recoveryState, false), false);
  assert.equal(model.canDismissTwoFactorManagement?.(recoveryState, true), true);
  assert.equal(model.canDismissTwoFactorManagement?.(model.startSetupAuthorization?.(), false), true);
  assert.equal(
    model.canDismissTwoFactorManagement?.(model.startSetupAuthorization?.(), false, true),
    false,
  );
  assert.equal(model.getTwoFactorManagementCloseCleanup?.(true), null);
  assert.deepEqual(
    model.getTwoFactorManagementCloseCleanup?.(false),
    model.createTwoFactorManagementState?.(),
  );
  assert.equal(model.canStartTwoFactorLifecycle?.(false), true);
  assert.equal(model.canStartTwoFactorLifecycle?.(true), false);
});
