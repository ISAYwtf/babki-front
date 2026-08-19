import { LucideCurrency } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

export function AuthShell({ children }: PropsWithChildren) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-[calc(100dvh-5rem)] w-full min-w-0 items-center px-3 py-6 sm:px-8 sm:py-8">
      <section
        className={`
          mx-auto grid w-full min-w-0 max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl
          sm:rounded-3xl
          lg:grid-cols-[0.9fr_1.1fr]
        `}
      >
        <div
          className={`
            flex flex-col justify-between gap-10 bg-primary p-7 text-primary-foreground
            sm:p-10 lg:min-h-155
          `}
        >
          <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground text-primary">
              <LucideCurrency />
            </span>
            {t('auth.brand.name')}
          </div>

          <div className="max-w-sm">
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('auth.brand.title')}
            </p>
            <p className="mt-4 text-sm text-primary-foreground/70 sm:text-base">
              {t('auth.brand.description')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
