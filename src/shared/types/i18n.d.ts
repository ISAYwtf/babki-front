import 'i18next';
import { resources, defaultNS } from '@/shared/lib/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources['ru'];
  }
}
