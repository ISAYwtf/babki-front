import { incomesQueryOptions } from '@/entities/incomes/api/incomes.query';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { CreateIncomeButton } from '@/features/create-income';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { type FC } from 'react';
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
      <div>Загрузка...</div>
    );
  }

  return (
    <CardAmount
      title={t('incomes.title')}
      value={totalRevenueData?.totalRevenue ?? 0}
      valueNotation="standard"
      controls={<CreateIncomeButton />}
      items={incomesData?.items?.map(({ incomeDate, source, amount }) => ({
        title: source,
        date: format(incomeDate, 'LLL d, y', { locale: ru }),
        value: amount,
      }))}
    />
  );
};
