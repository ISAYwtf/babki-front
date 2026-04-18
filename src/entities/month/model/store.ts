import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FIRST_MONTH_INDEX,
  LAST_MONTH_INDEX,
} from './constants';

export interface IMonthStore {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
}

function getInitialMonth() {
  return new Date().getMonth();
}

function clampMonth(month: number) {
  return Math.min(LAST_MONTH_INDEX, Math.max(FIRST_MONTH_INDEX, month));
}

export const useMonthStore = create<IMonthStore>()(
  persist(
    (set) => ({
      selectedMonth: getInitialMonth(),
      setSelectedMonth: (month) => set({ selectedMonth: clampMonth(month) }),
    }),
    {
      name: 'babki-selected-month',
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
      }),
    },
  ),
);
