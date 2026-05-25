import { expenseLimitsQueryOptions } from '@/entities/expense-limits';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Body1 } from '@/shared/ui/typography/typography';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { type FC } from 'react';

const locale = i18next.language;
const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

export const ExpenseLimits: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: limitsData, isLoading: limitsLoading } = useQuery(
    expenseLimitsQueryOptions.findAll({ periodDate: selectedPeriod.toDate }),
  );

  if (limitsLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <Card.Base className="h-fit min-w-max">
      <Card.Header>
        <Card.Title>По лимитам</Card.Title>
      </Card.Header>
      <Card.Content className="px-0">
        {limitsData?.map(({
          _id, category, total, rest,
        }) => (
          <div key={_id} className="px-5 pb-5">
            <Progress.Root value={((total - rest) / total) * 100} variant={rest > 0 ? 'success' : 'danger'}>
              <Progress.Label>{category.name}</Progress.Label>
              <Progress.Value>
                {() => formatAmount.format(rest)}
              </Progress.Value>
            </Progress.Root>
          </div>
        ))}
        {!limitsData?.length && (
          <div className="w-fit m-auto p-5">
            <Body1 className="text-muted-foreground">Данные отсутствуют</Body1>
          </div>
        )}
      </Card.Content>
    </Card.Base>
  );
};
