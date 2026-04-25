import { startOfMonth, format } from 'date-fns';
import { useMemo } from 'react';
import { useMonthStore } from '../model/store';

export const useSelectedPeriod = () => {
  const selectedMonth = useMonthStore((state) => state.selectedMonth);
  const selectedDate = new Date().setMonth(selectedMonth);
  const formattedSelectedDate = format(new Date().setMonth(selectedMonth), 'yyyy-MM-dd');
  const startOfSelectedMonth = format(startOfMonth(selectedDate), 'yyyy-MM-dd');

  return useMemo(() => ({
    from: startOfSelectedMonth,
    to: formattedSelectedDate,
  }), [formattedSelectedDate, startOfSelectedMonth]);
};
