import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FIRST_MONTH_INDEX,
  LAST_MONTH_INDEX,
} from './constants';

export interface IPeriodStore {
  selectedYear: number;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
}

function getInitialMonth() {
  return new Date().getMonth();
}

function getInitialYear() {
  return new Date().getFullYear();
}

function clampMonth(month: number) {
  return Math.min(LAST_MONTH_INDEX, Math.max(FIRST_MONTH_INDEX, month));
}

export const usePeriodStore = create<IPeriodStore>()(
  persist(
    (set) => ({
      selectedYear: getInitialYear(),
      selectedMonth: getInitialMonth(),
      setSelectedMonth: (month) => set({ selectedMonth: clampMonth(month) }),
      setSelectedYear: (year) => set({ selectedYear: year }),
    }),
    {
      name: 'babki-selected-period',
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
      }),
    },
  ),
);
