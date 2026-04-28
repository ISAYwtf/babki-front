import { expensesQueryOptions } from '@/entities/expenses';
import { useSelectedPeriod } from '@/entities/month/hooks/useSelectedPeriod';
import { usersQueryOptions } from '@/entities/users';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { env } from '@/shared/lib/env';
import { Card } from '@/shared/ui/card';
import { ExpenseCategory } from '@/shared/ui/expense-category';
import { Table } from '@/shared/ui/table';
import {
  Body1,
  Body2,
} from '@/shared/ui/typography/typography';
import { Accordion } from '@base-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import i18next from 'i18next';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

const locale = i18next.language;
const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

export const Expenses: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: userData } = useSuspenseQuery(usersQueryOptions.findOne(env.USER_ID));
  const { data: expensesData, isLoading } = useQuery(
    expensesQueryOptions.findAll(userData._id, selectedPeriod),
  );
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <Card.Base className="h-fit min-w-max">
      <Card.Header>
        <Card.Title>{t('expenses.title')}</Card.Title>
      </Card.Header>
      <Card.Content className="px-0">
        <Table.Base>
          <Accordion.Root render={<Table.Body />}>
            {expensesData?.items.map(({
              _id, amount, expenseDate, merchant, category, description, items,
            }) => (
              <Accordion.Item key={_id} render={<Table.Row />}>
                <div className="grid grid-cols-4 items-center">
                  <Table.Cell>
                    <ExpenseCategory color={category.color}>{category.name}</ExpenseCategory>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-1 items-start">
                      {description}
                      {!!items.length && (
                      <Accordion.Trigger>
                        <Body2 className="text-muted-foreground in-data-panel-open:hidden">
                          {t('expenses.expandItems')}
                        </Body2>
                        <Body2 className="hidden text-muted-foreground in-data-panel-open:block">
                          {t('expenses.collapseItems')}
                        </Body2>
                      </Accordion.Trigger>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-1">
                      {formatAmount.format(amount)}
                      <Body2 className="text-muted-foreground">
                        {expenseDate && format(expenseDate, 'LLLL d, y', { locale: ru })}
                      </Body2>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-body-2 text-muted-foreground">{merchant}</Table.Cell>
                </div>
                <Accordion.Panel render={<Table.Base className="px-5" />}>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>{t('expenses.itemFields.name')}</Table.Head>
                      <Table.Head>{t('expenses.itemFields.quantity')}</Table.Head>
                      <Table.Head>{t('expenses.itemFields.price')}</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {items.map(({ name, quantity, price }) => (
                      <Table.Row key={name}>
                        <Table.Cell>{name}</Table.Cell>
                        <Table.Cell>{quantity}</Table.Cell>
                        <Table.Cell>{formatAmount.format(price)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
            {!expensesData?.items.length && (
              <div className="w-fit m-auto p-5">
                <Body1 className="text-muted-foreground">Данные отсутствуют</Body1>
              </div>
            )}
          </Accordion.Root>
        </Table.Base>
      </Card.Content>
    </Card.Base>
  );
};
