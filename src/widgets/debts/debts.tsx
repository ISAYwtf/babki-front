import { type Debt, debtsQueryOptions } from '@/entities/debts';
import { CreateDebtButton } from '@/features/create-debt';
import { DebtDetailsDialog } from '@/features/manage-debt';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
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
      <div>Загрузка...</div>
    );
  }

  return (
    <Card.Base>
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
