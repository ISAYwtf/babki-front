import i18next from 'i18next';
import { getCurrency } from 'locale-currency';
import currencyData from './currency-codes.json';

export const currencyCodes = Array.from(new Set(
  currencyData.ISO_4217.CcyTbl.CcyNtry
    .map((entry) => entry.Ccy)
    .filter((code): code is string => typeof code === 'string'),
)).sort((left, right) => {
  if (left === 'RUB') return -1;
  if (right === 'RUB') return 1;
  return left.localeCompare(right);
});

export const getCurrentCurrencyCode = () => getCurrency(i18next.language) ?? 'RUB';
