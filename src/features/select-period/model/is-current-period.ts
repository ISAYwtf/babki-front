export const isCurrentPeriod = (
  selectedMonth: number,
  selectedYear: number,
  now = new Date(),
) => selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
