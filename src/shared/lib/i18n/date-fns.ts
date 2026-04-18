import { format } from 'date-fns';
import { enUS, ru, type Locale } from 'date-fns/locale';

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  'en-US': enUS,
  ru,
};

export function getDateFnsLocale(language?: string) {
  if (!language) {
    return enUS;
  }

  return DATE_FNS_LOCALES[language] ?? DATE_FNS_LOCALES[language.split('-')[0]] ?? enUS;
}

export function formatMonthIndex(month: number, language?: string) {
  const locale = getDateFnsLocale(language);
  const monthDate = new Date().setMonth(month);

  return format(monthDate, 'LLLL', { locale });
}
