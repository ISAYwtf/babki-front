import { Link, useRouter } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { getFirstFieldError } from '@/shared/lib/form-errors';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import { useLoginMutation } from '../api/auth.query';
import {
  defaultLoginFormValues,
  getAuthMutationErrorKey,
  getAuthValidationKey,
  loginSchema,
} from '../model/auth-form';
import { getSafeInternalRedirect } from '../model/session';
import { PasswordInput } from './password-input';

interface LoginFormProps {
  redirect?: string;
}

export function LoginForm({ redirect }: LoginFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const mutationError = loginMutation.isError
    ? t(getAuthMutationErrorKey(loginMutation.error, 'login'))
    : undefined;

  const clearMutationError = () => {
    if (loginMutation.isError) {
      loginMutation.reset();
    }
  };

  const form = useForm({
    defaultValues: defaultLoginFormValues,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync(value);
        router.history.replace(getSafeInternalRedirect(redirect) ?? '/main');
      } catch {
        // Mutation state retains the error and form values for retry.
      }
    },
  });

  const getValidationMessage = (errors: unknown[]) => {
    const key = getAuthValidationKey(getFirstFieldError(errors));
    return key ? t(key) : undefined;
  };

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
      <form.Field name="email">
        {(field) => {
          const error = getValidationMessage(field.state.meta.errors);

          return (
            <div>
              <Input.Label htmlFor="login-email">{t('auth.fields.email')}</Input.Label>
              <Input.Base
                id="login-email"
                name={field.name}
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  clearMutationError();
                  field.handleChange(event.target.value);
                }}
                hasError={Boolean(error)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-email-error' : undefined}
                disabled={loginMutation.isPending}
              />
              {error && (
                <Input.Error id="login-email-error" role="alert">{error}</Input.Error>
              )}
            </div>
          );
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const error = getValidationMessage(field.state.meta.errors);

          return (
            <div>
              <Input.Label htmlFor="login-password">{t('auth.fields.password')}</Input.Label>
              <PasswordInput
                id="login-password"
                name={field.name}
                autoComplete="current-password"
                maxLength={128}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  clearMutationError();
                  field.handleChange(event.target.value);
                }}
                hasError={Boolean(error)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-password-error' : undefined}
                disabled={loginMutation.isPending}
              />
              {error && (
                <Input.Error id="login-password-error" role="alert">{error}</Input.Error>
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
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
      </Button.Base>

      <Typography.Body3 className="text-center text-muted-foreground">
        {t('auth.login.noAccount')}
        {' '}
        <Link className="font-medium text-foreground underline underline-offset-4" to="/register">
          {t('auth.login.registerLink')}
        </Link>
      </Typography.Body3>
    </form>
  );
}
