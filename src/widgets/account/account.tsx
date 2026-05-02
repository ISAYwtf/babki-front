import { accountsQueryOptions } from '@/entities/accounts';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { usersQueryOptions } from '@/entities/users';
import { env } from '@/shared/lib/env';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Account: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: userData } = useSuspenseQuery(usersQueryOptions.findOne(env.USER_ID));
  const { data: accountData, isLoading } = useQuery(accountsQueryOptions.findByUserId(userData._id, selectedPeriod.to));
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <CardAmount
      title={t('account.title')}
      value={accountData?.amount ?? 0}
      valueNotation="standard"
      classes={{
        value: 'text-success',
      }}
    />
  );
};
