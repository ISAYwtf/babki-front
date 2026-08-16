import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { useCompleteTwoFactorLoginMutation } from '../api/auth.query';
import { getAuthValidationKey, recoveryCodeSchema } from '../model/auth-form';
import type { TwoFactorChallengeResponse } from '../model/schemas';
import { getTwoFactorErrorKey } from '../model/two-factor-errors';
import { useRetryAfter } from './use-retry-after';

interface RecoveryLoginFormProps {
  challenge: TwoFactorChallengeResponse;
  redirect: string | null;
  onUseTotp: (isPending: boolean) => void;
  onRestart: () => void;
}

const recoveryFormSchema = z.object({ code: recoveryCodeSchema });

export function RecoveryLoginForm({
  challenge,
  redirect,
  onUseTotp,
  onRestart,
}: RecoveryLoginFormProps) {
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
    validators: { onSubmit: recoveryFormSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync({
          challengeToken: challenge.challengeToken,
          method: 'recovery',
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
        {t('auth.twoFactor.login.recoveryDescription')}
      </Typography.Body3>
      <form.Field name="code">
        {(field) => {
          const key = getAuthValidationKey(getFirstFieldError(field.state.meta.errors));
          const error = key ? t(key) : undefined;
          return (
            <div>
              <Input.Label htmlFor="login-recovery">{t('auth.twoFactor.fields.recovery')}</Input.Label>
              <Input.Base
                id="login-recovery"
                name={field.name}
                type="text"
                autoComplete="off"
                spellCheck={false}
                maxLength={35}
                autoCapitalize="characters"
                autoFocus
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  mutation.reset();
                  field.handleChange(event.target.value.toUpperCase());
                }}
                hasError={Boolean(error)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-recovery-error' : undefined}
                disabled={isDisabled}
              />
              {error && (
                <Input.Error id="login-recovery-error" role="alert">{error}</Input.Error>
              )}
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
        {mutation.isPending
          ? t('auth.twoFactor.login.submitting')
          : t('auth.twoFactor.login.submitRecovery')}
      </Button.Base>
      <Button.Base
        type="button"
        variant="outline"
        disabled={isDisabled}
        onClick={() => onUseTotp(mutation.isPending)}
      >
        {t('auth.twoFactor.login.useTotp')}
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
