import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { savingsQueryOptions } from '@/entities/savings';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Savings: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: savingData, isLoading } = useQuery(savingsQueryOptions.findByUserId(selectedPeriod.to));
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <CardAmount
      title={t('savings.title')}
      value={savingData?.amount ?? 0}
      valueNotation="standard"
    />
  );
};
