import { usePeriodStore } from '@/entities/period';
import { reportsQueryOptions } from '@/entities/reports';
import { getPercent } from '@/shared/lib/getPercent';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

export const YearIncomes: FC = () => {
  const selectedYear = usePeriodStore((state) => state.selectedYear);
  const { data: yearReports, isLoading: reportsLoading } = useQuery(reportsQueryOptions.yearly());
  const { t } = useTranslation();

  if (reportsLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  const currentYearReport = yearReports?.find(({ period }) => (
    Number(period) === selectedYear));
  const prevYearReport = yearReports?.find(({ period }) => (
    Number(period) === selectedYear - 1));
  const diffAmount = getPercent(currentYearReport?.incomes, prevYearReport?.incomes);

  return (
    <CardAmount
      title={t('incomes.title')}
      value={currentYearReport?.incomes ?? 0}
      valueNotation="standard"
      diff={diffAmount}
    />
  );
};
