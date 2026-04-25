import { incomesQueryOptions } from '@/entities/incomes/api/incomes.query';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { usersQueryOptions } from '@/entities/users';
import { env } from '@/shared/lib/env';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Incomes: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: userData } = useSuspenseQuery(usersQueryOptions.findOne(env.USER_ID));
  const { data: incomesData = { totalRevenue: 0 }, isLoading } = useQuery(
    incomesQueryOptions.findTotalRevenue(userData._id, selectedPeriod),
  );
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <CardAmount
      title={t('incomes.title')}
      value={incomesData?.totalRevenue}
      valueNotation="standard"
    />
  );
};
