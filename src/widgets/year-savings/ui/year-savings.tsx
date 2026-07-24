import { reportsQueryOptions } from '@/entities/reports';
import { usePeriodStore } from '@/features/select-period';
import { getPercent } from '@/shared/lib/getPercent';
import { CardAmount, CardAmountSkeleton } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const YearSavings: FC = () => {
  const selectedYear = usePeriodStore((state) => state.selectedYear);
  const { data: yearReports, isLoading: reportsLoading } = useQuery(reportsQueryOptions.yearly());
  const { t } = useTranslation();

  if (reportsLoading) {
    return (
      <CardAmountSkeleton title={t('savings.title')} withDiff />
    );
  }

  const currentYearReport = yearReports?.find(({ period }) => (
    Number(period) === selectedYear));
  const prevYearReport = yearReports?.find(({ period }) => (
    Number(period) === selectedYear - 1));
  const diffAmount = getPercent(currentYearReport?.saving, prevYearReport?.saving);

  return (
    <CardAmount
      title={t('savings.title')}
      value={currentYearReport?.saving ?? 0}
      valueNotation="standard"
      diff={diffAmount}
    />
  );
};
