import { usePeriodStore } from '@/entities/period';
import { reportsQueryOptions } from '@/entities/reports';
import { CardList } from '@/shared/ui/card-list';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const LastYearRest: FC = () => {
  const { t } = useTranslation();
  const { data: yearReports } = useQuery(reportsQueryOptions.yearly());
  const currentYear = usePeriodStore((state) => state.selectedYear);
  const prevYearReport = yearReports?.find((report) => (
    Number(report.period) === currentYear - 1));

  if (!prevYearReport) {
    return null;
  }

  return (
    <CardList
      title={t('fromLastYear.title')}
      items={[
        { title: t('fromLastYear.rest'), value: prevYearReport.balance },
        { title: t('fromLastYear.savings'), value: prevYearReport.saving },
      ]}
    />
  );
};
