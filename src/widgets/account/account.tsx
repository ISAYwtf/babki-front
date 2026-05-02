import { accountsQueryOptions } from '@/entities/accounts';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Account: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: accountData, isLoading } = useQuery(accountsQueryOptions.findByDate(selectedPeriod.to));
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
