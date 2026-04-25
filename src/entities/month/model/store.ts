import {
  format,
  startOfMonth,
} from 'date-fns';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FIRST_MONTH_INDEX,
  LAST_MONTH_INDEX,
} from './constants';

export interface IMonthStore {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  getSelectedPeriod: () => { from: string; to: string };
}

function getInitialMonth() {
  return new Date().getMonth();
}

function clampMonth(month: number) {
  return Math.min(LAST_MONTH_INDEX, Math.max(FIRST_MONTH_INDEX, month));
}

export const useMonthStore = create<IMonthStore>()(
  persist(
    (set, getState) => ({
      selectedMonth: getInitialMonth(),
      setSelectedMonth: (month) => set({ selectedMonth: clampMonth(month) }),
      getSelectedPeriod: () => {
        const { selectedMonth } = getState();
        const selectedDate = new Date().setMonth(selectedMonth);
        const formattedSelectedDate = format(new Date().setMonth(selectedMonth), 'yyyy-MM-dd');
        const startOfSelectedMonth = format(startOfMonth(selectedDate), 'yyyy-MM-dd');

        return {
          from: startOfSelectedMonth,
          to: formattedSelectedDate,
        };
      },
    }),
    {
      name: 'babki-selected-month',
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
      }),
    },
  ),
);
