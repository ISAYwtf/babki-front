import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./recovery-codes.ts').catch(() => ({}));

const codes = [
  'ABCDE-FGHJK-MNPQR-STUVW-XYZ234',
  'BCDEF-GHJKM-NPQRS-TUVWX-YZ2345',
];

test('formats all recovery codes as one code per line for explicit copying', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.formatRecoveryCodesForCopy, 'function');
  assert.equal(model.formatRecoveryCodesForCopy?.(codes), codes.join('\n'));
});

test('requires acknowledgement before normal dismissal', async () => {
  const model = await modelPromise;

  assert.equal(model.canDismissRecoveryCodes?.(false), false);
  assert.equal(model.canDismissRecoveryCodes?.(true), true);
});

test('reports clipboard success or failure without swallowing the failure', async () => {
  const model = await modelPromise;

  assert.equal(await model.copyRecoveryCodes?.(codes, async (text) => {
    assert.equal(text, codes.join('\n'));
  }), 'copied');
  assert.equal(await model.copyRecoveryCodes?.(codes, async () => {
    throw new Error('clipboard denied');
  }), 'error');
});

test('prevents duplicate clipboard actions while a write is pending', async () => {
  const model = await modelPromise;

  assert.equal(typeof model.canStartClipboardCopy, 'function');
  assert.equal(model.canStartClipboardCopy?.('idle'), true);
  assert.equal(model.canStartClipboardCopy?.('copied'), true);
  assert.equal(model.canStartClipboardCopy?.('error'), true);
  assert.equal(model.canStartClipboardCopy?.('copying'), false);
});

test('clears plaintext at every terminal transition', async () => {
  const model = await modelPromise;
  const state = { recoveryCodes: codes, acknowledged: true, copyResult: 'copied' };

  assert.deepEqual(model.clearRecoveryCodes?.(state), {
    recoveryCodes: null,
    acknowledged: false,
    copyResult: 'idle',
  });
});

test('creates ten uniquely associated recovery-code fields', async () => {
  const model = await modelPromise;
  const tenCodes = Array.from({ length: 10 }, (_, index) => `RECOVERY-CODE-${index + 1}`);
  const fields = model.createRecoveryCodeFields?.(tenCodes);

  assert.equal(fields?.length, 10);
  assert.equal(new Set(fields?.map((field) => field.id)).size, 10);
  assert.deepEqual(fields?.[0], {
    code: 'RECOVERY-CODE-1',
    id: 'two-factor-recovery-code-1',
    number: 1,
  });
  assert.deepEqual(fields?.[9], {
    code: 'RECOVERY-CODE-10',
    id: 'two-factor-recovery-code-10',
    number: 10,
  });
});
