import { balancesQueryOptions } from '@/entities/balances';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { usersQueryOptions } from '@/entities/users';
import { env } from '@/shared/lib/env';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Balance: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: userData } = useSuspenseQuery(usersQueryOptions.findOne(env.USER_ID));
  const { data: balanceData = { currentAccountAmount: 0 }, isLoading } = useQuery(
    balancesQueryOptions.findByUserId(userData._id, selectedPeriod.to),
  );
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <CardAmount
      title={t('balance.title')}
      value={balanceData.currentAccountAmount}
      valueNotation="standard"
      classes={{
        value: 'text-success',
      }}
    />
  );
};
