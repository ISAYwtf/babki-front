import { useTranslation } from 'react-i18next';
import { LoginForm } from '@/features/auth';
import { Typography } from '@/shared/ui/typography';
import { AuthShell } from '@/widgets/auth-shell';

interface LoginPageProps {
  redirect?: string;
}

export function LoginPage({ redirect }: LoginPageProps) {
  const { t } = useTranslation();

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="text-title-1 text-3xl">{t('auth.login.title')}</h1>
        <Typography.Body3 className="mt-2 text-muted-foreground">
          {t('auth.login.description')}
        </Typography.Body3>
      </div>
      <LoginForm redirect={redirect} />
    </AuthShell>
  );
}
