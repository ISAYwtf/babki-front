import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { useCompleteTwoFactorLoginMutation } from '../api/auth.query';
import { getAuthValidationKey, totpCodeSchema } from '../model/auth-form';
import type { TwoFactorChallengeResponse } from '../model/schemas';
import { getTwoFactorErrorKey } from '../model/two-factor-errors';
import { TotpCodeInput } from './totp-code-input';
import { useRetryAfter } from './use-retry-after';

interface TotpLoginFormProps {
  challenge: TwoFactorChallengeResponse;
  redirect: string | null;
  onUseRecovery: (isPending: boolean) => void;
  onRestart: () => void;
}

const totpFormSchema = z.object({ code: totpCodeSchema });

export function TotpLoginForm({
  challenge,
  redirect,
  onUseRecovery,
  onRestart,
}: TotpLoginFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useCompleteTwoFactorLoginMutation();
  const retryAfter = useRetryAfter();
  const isDisabled = mutation.isPending || retryAfter.isBlocked;
  const mutationError = mutation.isError
    ? t(getTwoFactorErrorKey(mutation.error, 'login'), { seconds: retryAfter.remainingSeconds })
    : undefined;
  const form = useForm({
    defaultValues: { code: '' },
    validators: { onSubmit: totpFormSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync({
          challengeToken: challenge.challengeToken,
          method: 'totp',
          code: value.code,
        });
        router.history.replace(redirect ?? '/main');
      } catch (error) {
        retryAfter.applyError(error);
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <Typography.Body3 className="text-muted-foreground">
        {t('auth.twoFactor.login.totpDescription', {
          time: new Date(challenge.expiresAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })}
      </Typography.Body3>
      <form.Field name="code">
        {(field) => {
          const key = getAuthValidationKey(getFirstFieldError(field.state.meta.errors));
          const error = key ? t(key) : undefined;
          return (
            <div>
              <Input.Label htmlFor="login-totp">{t('auth.twoFactor.fields.totp')}</Input.Label>
              <TotpCodeInput
                id="login-totp"
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
                aria-describedby={error ? 'login-totp-error' : undefined}
                disabled={isDisabled}
              />
              {error && <Input.Error id="login-totp-error" role="alert">{error}</Input.Error>}
            </div>
          );
        }}
      </form.Field>
      {mutationError && (
        <Typography.Caption1
          className="text-destructive"
          role="alert"
          aria-live="polite"
        >
          {mutationError}
        </Typography.Caption1>
      )}
      <Button.Base
        className="w-full"
        type="submit"
        disabled={isDisabled}
      >
        {mutation.isPending ? t('auth.twoFactor.login.submitting') : t('auth.twoFactor.login.submit')}
      </Button.Base>
      <Button.Base
        type="button"
        variant="outline"
        disabled={isDisabled}
        onClick={() => onUseRecovery(mutation.isPending)}
      >
        {t('auth.twoFactor.login.useRecovery')}
      </Button.Base>
      <Button.Base
        type="button"
        variant="link"
        disabled={mutation.isPending}
        onClick={onRestart}
      >
        {t('auth.twoFactor.login.restart')}
      </Button.Base>
    </form>
  );
}
