import { type Debt, debtsQueryOptions } from '@/entities/debts';
import { CreateDebtButton } from '@/features/create-debt';
import { DebtDetailsDialog } from '@/features/manage-debt';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table } from '@/shared/ui/table';
import { Body1 } from '@/shared/ui/typography/typography';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import i18next from 'i18next';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

const locale = i18next.language;
const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

export const Debts: FC = () => {
  const { data: debtsData, isLoading } = useQuery(
    debtsQueryOptions.findAll({ status: 'active', limit: 5 }),
  );
  const { t } = useTranslation();
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  if (isLoading) {
    return (
      <Card.Base aria-busy="true" className="min-h-64">
        <span className="sr-only">Загрузка...</span>
        <Card.Header>
          <Card.Title>{t('debts.title')}</Card.Title>
          <Card.Controls>
            <CreateDebtButton />
          </Card.Controls>
        </Card.Header>
        <Card.Content className="px-0">
          <Table.Base>
            <Table.Body>
              {['first', 'second', 'third'].map((row) => (
                <Table.Row key={row}>
                  <Table.Cell><Skeleton className="h-4 w-28" /></Table.Cell>
                  <Table.Cell><Skeleton className="h-4 w-24" /></Table.Cell>
                  <Table.Cell><Skeleton className="ml-auto h-4 w-20" /></Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Base>
        </Card.Content>
      </Card.Base>
    );
  }

  return (
    <Card.Base className="min-h-64">
      <Card.Header>
        <Card.Title>{t('debts.title')}</Card.Title>
        <Card.Controls>
          <CreateDebtButton />
        </Card.Controls>
      </Card.Header>
      <Card.Content className="px-0">
        <Table.Base>
          <Table.Body>
            {debtsData?.items.map((debt) => (
              <Table.Row
                key={debt._id}
                role="button"
                tabIndex={0}
                className="cursor-pointer transition-colors hover:bg-muted"
                onClick={() => setSelectedDebt(debt)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedDebt(debt);
                  }
                }}
              >
                <Table.Cell>{debt.debtor}</Table.Cell>
                <Table.Cell
                  className="text-body-2 text-muted-foreground"
                  title={debt.dueDate && format(new Date(debt.dueDate), 'P', { locale: ru })}
                >
                  {debt.dueDate && format(new Date(debt.dueDate), 'LLLL d, y', { locale: ru })}
                </Table.Cell>
                <Table.Cell className="text-right">{formatAmount.format(debt.remainingAmount)}</Table.Cell>
              </Table.Row>
            ))}
            {!debtsData?.items.length && (
              <div className="w-fit m-auto p-5">
                <Body1 className="text-muted-foreground">Данные отсутствуют</Body1>
              </div>
            )}
          </Table.Body>
        </Table.Base>
      </Card.Content>

      <DebtDetailsDialog debt={selectedDebt} onClose={() => setSelectedDebt(null)} />
    </Card.Base>
  );
};
