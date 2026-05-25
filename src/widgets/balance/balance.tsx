import { balancesQueryOptions } from '@/entities/balances';
import { useSelectedPeriod } from '@/entities/period/hooks/useSelectedPeriod';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Balance: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: balanceData, isLoading: balanceLoading } = useQuery(balancesQueryOptions.find({
    toDate: selectedPeriod.toDate,
  }));
  const { t } = useTranslation();

  if (balanceLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <CardAmount
      title={t('account.title')}
      value={balanceData?.amount ?? 0}
      valueNotation="standard"
      classes={{ value: 'text-success' }}
    />
  );
};
