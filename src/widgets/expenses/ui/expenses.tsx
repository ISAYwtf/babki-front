import { ExpenseCategoryBadge } from '@/entities/expense-categories';
import { expensesQueryOptions } from '@/entities/expenses';
import { ExpenseActions } from '@/features/manage-expense';
import {
  useIsCurrentPeriod,
  useSelectedPeriod,
} from '@/features/select-period';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table } from '@/shared/ui/table';
import {
  Body1,
  Body2,
} from '@/shared/ui/typography';
import { Accordion } from '@base-ui/react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import i18next from 'i18next';
import type { FC } from 'react';
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
  const isCurrentPeriod = useIsCurrentPeriod();
  const rowGridClassName = isCurrentPeriod
    ? 'grid grid-cols-[repeat(4,minmax(0,170px))_minmax(48px,1fr)] items-center'
    : 'grid grid-cols-[repeat(4,minmax(0,170px))] items-center';
  const { data: expensesData, isLoading } = useQuery(
    expensesQueryOptions.findAll(selectedPeriod),
  );
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card.Base aria-busy="true" className="h-fit min-h-64 min-w-max">
        <span className="sr-only">Загрузка...</span>
        <Card.Header>
          <Card.Title>{t('expenses.title')}</Card.Title>
        </Card.Header>
        <Card.Content className="px-0">
          <Table.Base>
            <Table.Body>
              {['first', 'second', 'third'].map((row) => (
                <Table.Row key={row}>
                  <div className={rowGridClassName}>
                    <Table.Cell><Skeleton className="h-5 w-24" /></Table.Cell>
                    <Table.Cell><Skeleton className="h-4 w-32" /></Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </Table.Cell>
                    <Table.Cell><Skeleton className="h-4 w-28" /></Table.Cell>
                    {isCurrentPeriod && (
                      <Table.Cell className="flex justify-end py-5 pr-5 pl-0">
                        <Skeleton className="size-7" />
                      </Table.Cell>
                    )}
                  </div>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Base>
        </Card.Content>
      </Card.Base>
    );
  }

  return (
    <Card.Base className="h-fit min-h-64 min-w-max">
      <Card.Header>
        <Card.Title>{t('expenses.title')}</Card.Title>
      </Card.Header>
      <Card.Content className="px-0">
        <Table.Base>
          <Accordion.Root render={<Table.Body />}>
            {expensesData?.items.map(({
              _id, accountId, amount, transactionDate, merchant, category, description, items,
            }) => (
              <Accordion.Item key={_id} render={<Table.Row />}>
                <div className={rowGridClassName}>
                  <Table.Cell>
                    <ExpenseCategoryBadge color={category.color}>{category.name}</ExpenseCategoryBadge>
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
                      {!description && !items.length && <Body1 className="text-muted-foreground">Нет описания</Body1>}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-1">
                      {formatAmount.format(amount)}
                      <Body2 className="text-muted-foreground">
                        {transactionDate && format(transactionDate, 'LLLL d, y', { locale: ru })}
                      </Body2>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-body-2 text-muted-foreground">
                    {merchant ?? <Body1 className="text-muted-foreground">Место не указано</Body1>}
                  </Table.Cell>
                  {isCurrentPeriod && (
                    <Table.Cell
                      className="flex justify-end py-5 pr-5 pl-0"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ExpenseActions transactionId={_id} accountId={accountId} />
                    </Table.Cell>
                  )}
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
