import {
  startOfMonth,
  format,
  endOfMonth,
} from 'date-fns';
import { useMemo } from 'react';
import { useMonthStore } from '../model/store';

export const useSelectedPeriod = () => {
  const selectedMonth = useMonthStore((state) => state.selectedMonth);
  const now = new Date();
  const currentMonth = now.getMonth();
  const selectedDate = currentMonth === selectedMonth
    ? now.setMonth(selectedMonth)
    : endOfMonth(now.setMonth(selectedMonth));
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  const startOfSelectedMonth = format(startOfMonth(selectedDate), 'yyyy-MM-dd');

  return useMemo(() => ({
    from: startOfSelectedMonth,
    to: formattedSelectedDate,
  }), [formattedSelectedDate, startOfSelectedMonth]);
};
