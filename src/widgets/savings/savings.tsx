import { balancesQueryOptions } from '@/entities/balances';
import {
  usersQueryOptions,
} from '@/entities/users';
import { env } from '@/shared/lib/env';
import { CardAmount } from '@/shared/ui/card-amount';
import {
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Savings: FC = () => {
  const { data: userData } = useSuspenseQuery(usersQueryOptions.findOne(env.USER_ID));
  const { data: balanceData, isLoading } = useQuery(balancesQueryOptions.findByUserId(userData._id));
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  if (!balanceData) {
    return null;
  }

  return (
    <CardAmount
      title={t('savings.title')}
      value={balanceData.savingsAmount}
      valueNotation="standard"
    />
  );
};
