import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { useDisableTwoFactorMutation } from '../api/auth.query';
import {
  disableTwoFactorSchema,
  getAuthValidationKey,
} from '../model/schemas';
import { PasswordInput } from './password-input';
import { TotpCodeInput } from './totp-code-input';
import { TwoFactorFormError } from './two-factor-form-error';
import type { RetryAfterController } from './use-retry-after';

interface TwoFactorDisableFormProps {
  onBack: () => void;
  onSuccess: () => void;
  retryAfter: RetryAfterController;
}

type DisableMethod = 'totp' | 'recovery';

export function TwoFactorDisableForm({
  onBack,
  onSuccess,
  retryAfter,
}: TwoFactorDisableFormProps) {
  const { t } = useTranslation();
  const mutation = useDisableTwoFactorMutation();
  const isDisabled = mutation.isPending || retryAfter.isBlocked;
  const form = useForm({
    defaultValues: {
      password: '',
      method: 'totp' as DisableMethod,
      code: '',
    },
    validators: { onSubmit: disableTwoFactorSchema },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
        onSuccess();
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
      <Dialog.Description>{t('auth.twoFactor.disable.description')}</Dialog.Description>
      <div className="mt-5 flex flex-col gap-4">
        <form.Field name="password">
          {(field) => {
            const error = getError(field.state.meta.errors);
            return (
              <div>
                <Input.Label htmlFor="two-factor-disable-password">
                  {t('auth.twoFactor.fields.currentPassword')}
                </Input.Label>
                <PasswordInput
                  id="two-factor-disable-password"
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
                  aria-describedby={error ? 'two-factor-disable-password-error' : undefined}
                  disabled={isDisabled}
                />
                {error && (
                  <Input.Error id="two-factor-disable-password-error" role="alert">
                    {error}
                  </Input.Error>
                )}
              </div>
            );
          }}
        </form.Field>
        <form.Subscribe selector={(state) => state.values.method}>
          {(method) => (
            <form.Field name="code">
              {(field) => {
                const error = getError(field.state.meta.errors);
                const isTotp = method === 'totp';
                return (
                  <div>
                    <Input.Label htmlFor="two-factor-disable-code">
                      {t(isTotp ? 'auth.twoFactor.fields.totp' : 'auth.twoFactor.fields.recovery')}
                    </Input.Label>
                    {isTotp ? (
                      <TotpCodeInput
                        id="two-factor-disable-code"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(value) => {
                          mutation.reset();
                          field.handleChange(value);
                        }}
                        hasError={Boolean(error)}
                        aria-describedby={error ? 'two-factor-disable-code-error' : undefined}
                        disabled={isDisabled}
                      />
                    ) : (
                      <Input.Base
                        id="two-factor-disable-code"
                        name={field.name}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={35}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          mutation.reset();
                          field.handleChange(event.target.value.toUpperCase());
                        }}
                        hasError={Boolean(error)}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? 'two-factor-disable-code-error' : undefined}
                        disabled={isDisabled}
                      />
                    )}
                    {error && (
                      <Input.Error id="two-factor-disable-code-error" role="alert">
                        {error}
                      </Input.Error>
                    )}
                    <Button.Base
                      className="mt-2 px-0"
                      type="button"
                      variant="link"
                      disabled={isDisabled}
                      onClick={() => {
                        form.setFieldValue('method', isTotp ? 'recovery' : 'totp');
                        form.setFieldValue('code', '');
                        mutation.reset();
                      }}
                    >
                      {t(isTotp
                        ? 'auth.twoFactor.disable.useRecovery'
                        : 'auth.twoFactor.disable.useTotp')}
                    </Button.Base>
                  </div>
                );
              }}
            </form.Field>
          )}
        </form.Subscribe>
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
        <Button.Base
          type="submit"
          variant="destructive"
          disabled={isDisabled}
        >
          {mutation.isPending
            ? t('auth.twoFactor.disable.submitting')
            : t('auth.twoFactor.disable.submit')}
        </Button.Base>
      </Dialog.Footer>
    </form>
  );
}
