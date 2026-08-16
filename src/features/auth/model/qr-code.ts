export interface QrRenderOptions {
  errorCorrectionLevel: 'M';
  margin: number;
  width: number;
}

type QrRenderer = (value: string, options: QrRenderOptions) => Promise<string>;

export const generateQrDataUrl = async (
  otpauthUri: string,
  render: QrRenderer,
) => {
  const uri = new URL(otpauthUri);
  if (uri.protocol !== 'otpauth:' || uri.hostname !== 'totp') {
    throw new Error('Expected a validated otpauth TOTP URI');
  }

  const dataUrl = await render(otpauthUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
  });

  if (!dataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('Expected a local QR data URL');
  }

  return dataUrl;
};
