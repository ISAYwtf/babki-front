import { useSelectedPeriod } from '@/entities/period/hooks/useSelectedPeriod';
import { savingsQueryOptions } from '@/entities/savings';
import { savesQueryOptions } from '@/entities/saves';
import { CreateSaveButton } from '@/features/create-save';
import { CardAmount } from '@/shared/ui/card-amount';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Savings: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: savingData, isLoading: savingLoading } = useQuery(savingsQueryOptions.find({
    toDate: selectedPeriod.toDate,
  }));
  const snapshotsData = savingData?.timeline[0];
  const { data: transactionsData } = useQuery({
    ...savesQueryOptions.findAll({
      fromDate: selectedPeriod.fromDate,
      toDate: selectedPeriod.toDate,
      snapshotId: snapshotsData?._id,
      accountId: savingData?._id,
    }),
    enabled: Boolean(snapshotsData && savingData),
  });
  const { t } = useTranslation();
  const prevSnapshotData = savingData?.timeline[1];
  const diffAmount = (() => {
    if (snapshotsData && prevSnapshotData) {
      const diff = snapshotsData.amount - prevSnapshotData.amount;
      return diff / prevSnapshotData.amount;
    }

    return 0;
  })();

  if (savingLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <CardAmount
      title={t('savings.title')}
      value={savingData?.amount ?? 0}
      valueNotation="standard"
      controls={<CreateSaveButton />}
      diff={diffAmount}
      items={transactionsData?.items.map(({ transactionDate, amount }) => ({
        date: format(transactionDate, 'LLL d, y', { locale: ru }),
        value: amount,
      }))}
    />
  );
};
