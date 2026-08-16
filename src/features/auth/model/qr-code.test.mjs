import assert from 'node:assert/strict';
import test from 'node:test';

const modelPromise = import('./qr-code.ts').catch(() => ({}));

test('renders a validated otpauth URI with the injected local renderer only', async () => {
  const model = await modelPromise;
  const calls = [];
  const uri = 'otpauth://totp/Babki:user?secret=JBSWY3DPEHPK3PXP';

  assert.equal(typeof model.generateQrDataUrl, 'function');
  const result = await model.generateQrDataUrl?.(uri, async (value, options) => {
    calls.push({ value, options });
    return 'data:image/png;base64,local-qr';
  });

  assert.equal(result, 'data:image/png;base64,local-qr');
  assert.deepEqual(calls, [{
    value: uri,
    options: { errorCorrectionLevel: 'M', margin: 2, width: 256 },
  }]);
});

test('rejects remote or malformed renderer output', async () => {
  const model = await modelPromise;

  await assert.rejects(
    () => model.generateQrDataUrl?.(
      'otpauth://totp/Babki:user?secret=JBSWY3DPEHPK3PXP',
      async () => 'https://remote.example/qr.png',
    ),
    /local QR data URL/,
  );
});
