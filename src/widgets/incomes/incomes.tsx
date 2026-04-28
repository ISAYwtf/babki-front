import { incomesQueryOptions } from '@/entities/incomes/api/incomes.query';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { usersQueryOptions } from '@/entities/users';
import { CreateIncomeButton } from '@/features/create-income';
import { env } from '@/shared/lib/env';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Incomes: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: userData } = useSuspenseQuery(usersQueryOptions.findOne(env.USER_ID));
  const { data: totalRevenueData, isLoading: totalRevenueLoading } = useQuery(
    incomesQueryOptions.findTotalRevenue(userData._id, selectedPeriod),
  );
  const { data: incomesData, isLoading: incomesLoading } = useQuery(
    incomesQueryOptions.findAll(userData._id, selectedPeriod),
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
      controls={<CreateIncomeButton userId={userData._id} />}
      items={incomesData?.items?.map(({ incomeDate, source, amount }) => ({
        title: source,
        date: format(incomeDate, 'LLL d, y', { locale: ru }),
        value: amount,
      }))}
    />
  );
};
