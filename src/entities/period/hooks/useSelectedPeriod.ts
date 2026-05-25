import {
  startOfMonth,
  format,
  endOfMonth,
} from 'date-fns';
import { useMemo } from 'react';
import { usePeriodStore } from '../model/store';

const PERIOD_DATE_FORMAT = 'yyyy-MM-dd';

export const useSelectedPeriod = () => {
  const selectedMonth = usePeriodStore((state) => state.selectedMonth);
  const selectedYear = usePeriodStore((state) => state.selectedYear);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const selectedDate = currentMonth === selectedMonth && currentYear === selectedYear
    ? new Date(selectedYear, selectedMonth, now.getDate())
    : endOfMonth(new Date(selectedYear, selectedMonth));
  const formattedSelectedDate = format(selectedDate, PERIOD_DATE_FORMAT);
  const startOfSelectedMonth = format(startOfMonth(selectedDate), PERIOD_DATE_FORMAT);

  return useMemo(() => ({
    fromDate: startOfSelectedMonth,
    toDate: formattedSelectedDate,
  }), [formattedSelectedDate, startOfSelectedMonth]);
};
