import { useTranslation } from 'react-i18next';
import { Typography } from '@/shared/ui/typography';
import { getTwoFactorErrorKey } from '../model/two-factor-errors';

interface TwoFactorFormErrorProps {
  error: unknown;
  scope: 'setup' | 'management' | 'lifecycle';
  retryAfterSeconds: number;
}

export function TwoFactorFormError({
  error,
  scope,
  retryAfterSeconds,
}: TwoFactorFormErrorProps) {
  const { t } = useTranslation();

  return (
    <Typography.Caption1
      className="text-destructive"
      role="alert"
      aria-live="polite"
    >
      {t(getTwoFactorErrorKey(error, scope), { seconds: retryAfterSeconds })}
    </Typography.Caption1>
  );
}
