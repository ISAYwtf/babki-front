import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ruMain from './ru/main.json';

export const defaultNS = 'main';
export const resources = {
  ru: { main: ruMain },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      // react already safes from xss
      // https://www.i18next.com/translation-function/interpolation#unescape
      escapeValue: false,
    },
    defaultNS,
    resources,
  });
