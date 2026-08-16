import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import type { TwoFactorSetupResponse } from '../model/schemas';
import {
  getAuthValidationKey,
  twoFactorSetupSchema,
} from '../model/schemas';
import { useStartTwoFactorSetupMutation } from '../api/auth.query';
import { isTwoFactorStatusConflict } from '../model/two-factor-errors';
import { PasswordInput } from './password-input';
import { TwoFactorFormError } from './two-factor-form-error';
import type { RetryAfterController } from './use-retry-after';

interface TwoFactorSetupFormProps {
  onBack: () => void;
  retryAfter: RetryAfterController;
  onStatusChanged: () => void;
  onSuccess: (setup: TwoFactorSetupResponse) => void;
}

export function TwoFactorSetupForm({
  onBack,
  retryAfter,
  onStatusChanged,
  onSuccess,
}: TwoFactorSetupFormProps) {
  const { t } = useTranslation();
  const mutation = useStartTwoFactorSetupMutation(onSuccess);
  const isDisabled = mutation.isPending || retryAfter.isBlocked;
  const form = useForm({
    defaultValues: { password: '' },
    validators: { onSubmit: twoFactorSetupSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        if (isTwoFactorStatusConflict(error)) {
          onStatusChanged();
          return;
        }
        retryAfter.applyError(error);
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <Dialog.Description>{t('auth.twoFactor.setup.description')}</Dialog.Description>
      <div className="mt-5 flex flex-col gap-4">
        <form.Field name="password">
          {(field) => {
            const key = getAuthValidationKey(getFirstFieldError(field.state.meta.errors));
            const error = key ? t(key) : undefined;
            return (
              <div>
                <Input.Label htmlFor="two-factor-setup-password">
                  {t('auth.twoFactor.fields.currentPassword')}
                </Input.Label>
                <PasswordInput
                  id="two-factor-setup-password"
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
                  aria-describedby={error ? 'two-factor-setup-password-error' : undefined}
                  disabled={isDisabled}
                />
                {error && (
                  <Input.Error id="two-factor-setup-password-error" role="alert">
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
            scope="setup"
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
            ? t('auth.twoFactor.setup.submitting')
            : t('auth.twoFactor.setup.submit')}
        </Button.Base>
      </Dialog.Footer>
    </form>
  );
}
