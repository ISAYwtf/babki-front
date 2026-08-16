import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { useRegenerateRecoveryCodesMutation } from '../api/auth.query';
import {
  getAuthValidationKey,
  regenerateRecoveryCodesSchema,
} from '../model/schemas';
import { PasswordInput } from './password-input';
import { TotpCodeInput } from './totp-code-input';
import { TwoFactorFormError } from './two-factor-form-error';
import type { RetryAfterController } from './use-retry-after';

interface TwoFactorRegenerateFormProps {
  onBack: () => void;
  onSuccess: (recoveryCodes: string[]) => void;
  retryAfter: RetryAfterController;
}

export function TwoFactorRegenerateForm({
  onBack,
  onSuccess,
  retryAfter,
}: TwoFactorRegenerateFormProps) {
  const { t } = useTranslation();
  const mutation = useRegenerateRecoveryCodesMutation(onSuccess);
  const isDisabled = mutation.isPending || retryAfter.isBlocked;
  const form = useForm({
    defaultValues: { password: '', token: '' },
    validators: { onSubmit: regenerateRecoveryCodesSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        retryAfter.applyError(error);
      }
    },
  });

  const getError = (errors: unknown[]) => {
    const key = getAuthValidationKey(getFirstFieldError(errors));
    return key ? t(key) : undefined;
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
      <Dialog.Description>{t('auth.twoFactor.recovery.regenerateDescription')}</Dialog.Description>
      <div className="mt-5 flex flex-col gap-4">
        <form.Field name="password">
          {(field) => {
            const error = getError(field.state.meta.errors);
            return (
              <div>
                <Input.Label htmlFor="two-factor-regenerate-password">
                  {t('auth.twoFactor.fields.currentPassword')}
                </Input.Label>
                <PasswordInput
                  id="two-factor-regenerate-password"
                  name={field.name}
                  autoComplete="current-password"
                  autoFocus
                  maxLength={128}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    mutation.reset();
                    field.handleChange(event.target.value);
                  }}
                  hasError={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'two-factor-regenerate-password-error' : undefined}
                  disabled={isDisabled}
                />
                {error && (
                  <Input.Error id="two-factor-regenerate-password-error" role="alert">
                    {error}
                  </Input.Error>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Field name="token">
          {(field) => {
            const error = getError(field.state.meta.errors);
            return (
              <div>
                <Input.Label htmlFor="two-factor-regenerate-token">
                  {t('auth.twoFactor.fields.totp')}
                </Input.Label>
                <TotpCodeInput
                  id="two-factor-regenerate-token"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(value) => {
                    mutation.reset();
                    field.handleChange(value);
                  }}
                  hasError={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'two-factor-regenerate-token-error' : undefined}
                  disabled={isDisabled}
                />
                {error && (
                  <Input.Error id="two-factor-regenerate-token-error" role="alert">
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
          onClick={onBack}
        >
          {t('auth.twoFactor.management.back')}
        </Button.Base>
        <Button.Base type="submit" disabled={isDisabled}>
          {mutation.isPending
            ? t('auth.twoFactor.recovery.regenerating')
            : t('auth.twoFactor.recovery.regenerateSubmit')}
        </Button.Base>
      </Dialog.Footer>
    </form>
  );
}
