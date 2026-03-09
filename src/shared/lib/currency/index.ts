import i18next from 'i18next';
import { getCurrency } from 'locale-currency';

export const getCurrentCurrencyCode = () => getCurrency(i18next.language) ?? 'RUB';
