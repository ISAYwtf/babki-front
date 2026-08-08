import {
  startOfMonth,
  format,
  endOfMonth,
} from 'date-fns';
import { useMemo } from 'react';
import { isCurrentPeriod } from './is-current-period';
import { usePeriodStore } from './store';

const PERIOD_DATE_FORMAT = 'yyyy-MM-dd';

export const useSelectedPeriod = () => {
  const selectedMonth = usePeriodStore((state) => state.selectedMonth);
  const selectedYear = usePeriodStore((state) => state.selectedYear);
  const selectedDate = endOfMonth(new Date(selectedYear, selectedMonth));
  const formattedSelectedDate = format(selectedDate, PERIOD_DATE_FORMAT);
  const startOfSelectedMonth = format(startOfMonth(selectedDate), PERIOD_DATE_FORMAT);

  return useMemo(() => ({
    fromDate: startOfSelectedMonth,
    toDate: formattedSelectedDate,
  }), [formattedSelectedDate, startOfSelectedMonth]);
};

export const useIsCurrentPeriod = () => {
  const selectedMonth = usePeriodStore((state) => state.selectedMonth);
  const selectedYear = usePeriodStore((state) => state.selectedYear);

  return isCurrentPeriod(selectedMonth, selectedYear);
};
