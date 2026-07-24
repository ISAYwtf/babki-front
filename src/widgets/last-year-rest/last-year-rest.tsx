import { usePeriodStore } from '@/entities/period';
import { reportsQueryOptions } from '@/entities/reports';
import { Card } from '@/shared/ui/card';
import { CardList } from '@/shared/ui/card-list';
import { Skeleton } from '@/shared/ui/skeleton';
import { Typography } from '@/shared/ui/typography';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const LastYearRest: FC = () => {
  const { t } = useTranslation();
  const { data: yearReports, isLoading } = useQuery(reportsQueryOptions.yearly());
  const currentYear = usePeriodStore((state) => state.selectedYear);
  const prevYearReport = yearReports?.find((report) => (
    Number(report.period) === currentYear - 1));

  if (isLoading) {
    return (
      <Card.Base
        aria-busy="true"
        className="gap-6 max-w-xl min-h-28 p-3.5 w-2xs"
      >
        <span className="sr-only">Загрузка...</span>
        <Typography.Title3 className="text-muted-foreground uppercase">
          {t('fromLastYear.title')}
        </Typography.Title3>
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between gap-2.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between gap-2.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </Card.Base>
    );
  }

  if (!prevYearReport) {
    return (
      <Card.Base className="gap-6 max-w-xl min-h-28 p-3.5 w-2xs">
        <Typography.Title3 className="text-muted-foreground uppercase">
          {t('fromLastYear.title')}
        </Typography.Title3>
        <Typography.Body2 className="text-muted-foreground">
          Данные отсутствуют
        </Typography.Body2>
      </Card.Base>
    );
  }

  return (
    <CardList
      className="min-h-28"
      title={t('fromLastYear.title')}
      items={[
        { title: t('fromLastYear.rest'), value: prevYearReport.balance },
        { title: t('fromLastYear.savings'), value: prevYearReport.saving },
      ]}
    />
  );
};
