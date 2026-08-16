import { useForm } from '@tanstack/react-form';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { useConfirmTwoFactorSetupMutation } from '../api/auth.query';
import {
  confirmTwoFactorSetupSchema,
  getAuthValidationKey,
  type TwoFactorSetupResponse,
} from '../model/schemas';
import { generateQrDataUrl } from '../model/qr-code';
import {
  canStartClipboardCopy,
  type RecoveryCopyResult,
} from '../model/recovery-codes';
import { TotpCodeInput } from './totp-code-input';
import { TwoFactorFormError } from './two-factor-form-error';
import type { RetryAfterController } from './use-retry-after';

interface TwoFactorProvisioningFormProps {
  setup: TwoFactorSetupResponse;
  onExpired: () => void;
  onRestart: () => void;
  retryAfter: RetryAfterController;
  onSuccess: (recoveryCodes: string[]) => void;
}

const useSetupExpired = (expiresAt: string) => {
  const [expired, setExpired] = useState(() => Date.parse(expiresAt) <= Date.now());

  useEffect(() => {
    const update = () => setExpired(Date.parse(expiresAt) <= Date.now());
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  return expired;
};

export function TwoFactorProvisioningForm({
  setup,
  onExpired,
  onRestart,
  retryAfter,
  onSuccess,
}: TwoFactorProvisioningFormProps) {
  const { t } = useTranslation();
  const mutation = useConfirmTwoFactorSetupMutation(onSuccess);
  const expired = useSetupExpired(setup.expiresAt);
  const isDisabled = mutation.isPending || retryAfter.isBlocked || expired;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrFailed, setQrFailed] = useState(false);
  const [secretCopyResult, setSecretCopyResult] = useState<RecoveryCopyResult>('idle');
  const secretCopyPendingRef = useRef(false);

  useEffect(() => {
    if (expired) onExpired();
  }, [expired, onExpired]);

  useEffect(() => {
    if (expired) return undefined;
    let active = true;
    setQrDataUrl(null);
    setQrFailed(false);
    generateQrDataUrl(
      setup.otpauthUri,
      (value, options) => QRCode.toDataURL(value, options),
    ).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (active) setQrFailed(true);
    });
    return () => {
      active = false;
    };
  }, [expired, setup.otpauthUri]);

  const form = useForm({
    defaultValues: { token: '' },
    validators: { onSubmit: confirmTwoFactorSetupSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        retryAfter.applyError(error);
      }
    },
  });

  const copySecret = async () => {
    if (!canStartClipboardCopy(secretCopyResult) || secretCopyPendingRef.current) return;
    secretCopyPendingRef.current = true;
    setSecretCopyResult('copying');
    try {
      await navigator.clipboard.writeText(setup.secret);
      setSecretCopyResult('copied');
    } catch {
      setSecretCopyResult('error');
    } finally {
      secretCopyPendingRef.current = false;
    }
  };

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <Dialog.Description>{t('auth.twoFactor.setup.qrDescription')}</Dialog.Description>
      <div className="mt-5 flex min-w-0 flex-col gap-4">
        <div className="flex min-h-64 items-center justify-center rounded-lg border bg-white p-3">
          {qrDataUrl && (
            <img
              className="h-auto max-w-full"
              src={qrDataUrl}
              width={256}
              height={256}
              alt={t('auth.twoFactor.setup.qrAlt')}
            />
          )}
          {!qrDataUrl && !qrFailed && (
            <Typography.Body3 className="text-muted-foreground" role="status">
              {t('auth.twoFactor.setup.qrLoading')}
            </Typography.Body3>
          )}
          {qrFailed && (
            <Typography.Body3 className="text-destructive" role="alert">
              {t('auth.twoFactor.setup.qrError')}
            </Typography.Body3>
          )}
        </div>
        <div>
          <Typography.Body3 className="text-muted-foreground">
            {t('auth.twoFactor.setup.manualSecret')}
          </Typography.Body3>
          <code className="mt-2 block select-all break-all rounded-lg bg-muted p-3 text-sm">
            {setup.secret}
          </code>
          <Button.Base
            className="mt-2"
            type="button"
            variant="outline"
            disabled={secretCopyResult === 'copying'}
            aria-busy={secretCopyResult === 'copying'}
            onClick={copySecret}
          >
            {t(secretCopyResult === 'copying'
              ? 'auth.twoFactor.setup.copyingSecret'
              : 'auth.twoFactor.setup.copySecret')}
          </Button.Base>
          {secretCopyResult !== 'idle' && (
            <Typography.Caption1
              className={secretCopyResult === 'error' ? 'mt-2 text-destructive' : 'mt-2 text-muted-foreground'}
              role="status"
              aria-live="polite"
            >
              {t(secretCopyResult === 'copying'
                ? 'auth.twoFactor.setup.copyingSecret'
                : secretCopyResult === 'copied'
                  ? 'auth.twoFactor.setup.secretCopied'
                  : 'auth.twoFactor.setup.secretCopyError')}
            </Typography.Caption1>
          )}
        </div>
        <Typography.Body3 className="text-muted-foreground">
          {t('auth.twoFactor.setup.expires', {
            time: new Date(setup.expiresAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          })}
        </Typography.Body3>
        {expired && (
          <Typography.Caption1 className="text-destructive" role="alert">
            {t('auth.twoFactor.setup.expired')}
          </Typography.Caption1>
        )}
        <form.Field name="token">
          {(field) => {
            const key = getAuthValidationKey(getFirstFieldError(field.state.meta.errors));
            const error = key ? t(key) : undefined;
            return (
              <div>
                <Input.Label htmlFor="two-factor-confirm-token">
                  {t('auth.twoFactor.fields.totp')}
                </Input.Label>
                <TotpCodeInput
                  id="two-factor-confirm-token"
                  name={field.name}
                  autoFocus
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(value) => {
                    mutation.reset();
                    field.handleChange(value);
                  }}
                  hasError={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'two-factor-confirm-token-error' : undefined}
                  disabled={isDisabled}
                />
                {error && (
                  <Input.Error id="two-factor-confirm-token-error" role="alert">
                    {error}
                  </Input.Error>
                )}
              </div>
            );
          }}
        </form.Field>
        {mutation.isError && (
          <TwoFactorFormError
            error={mutation.error}
            scope="lifecycle"
            retryAfterSeconds={retryAfter.remainingSeconds}
          />
        )}
      </div>
      <Dialog.Footer className="flex-wrap">
        <Button.Base
          type="button"
          variant="outline"
          disabled={mutation.isPending}
          onClick={onRestart}
        >
          {t('auth.twoFactor.management.restartSetup')}
        </Button.Base>
        <Button.Base type="submit" disabled={isDisabled}>
          {mutation.isPending
            ? t('auth.twoFactor.setup.confirming')
            : t('auth.twoFactor.setup.confirm')}
        </Button.Base>
      </Dialog.Footer>
    </form>
  );
}
