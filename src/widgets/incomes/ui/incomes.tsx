import { incomesQueryOptions } from '@/entities/incomes';
import { useSelectedPeriod } from '@/features/select-period';
import { CreateIncomeButton } from '@/features/create-income';
import { CardAmount, CardAmountSkeleton } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Incomes: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: totalRevenueData, isLoading: totalRevenueLoading } = useQuery(
    incomesQueryOptions.findTotalRevenue(selectedPeriod),
  );
  const { data: incomesData, isLoading: incomesLoading } = useQuery(
    incomesQueryOptions.findAll(selectedPeriod),
  );
  const { t } = useTranslation();

  if (totalRevenueLoading || incomesLoading) {
    return (
      <CardAmountSkeleton title={t('incomes.title')} controls={<CreateIncomeButton />} />
    );
  }

  return (
    <CardAmount
      title={t('incomes.title')}
      value={totalRevenueData?.totalRevenue ?? 0}
      valueNotation="standard"
      controls={<CreateIncomeButton />}
      items={incomesData?.items?.map(({ transactionDate, source, amount }) => ({
        title: source,
        date: format(transactionDate, 'LLL d, y', { locale: ru }),
        value: amount,
      }))}
    />
  );
};
