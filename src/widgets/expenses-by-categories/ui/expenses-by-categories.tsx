import { expenseCategoriesQueryOptions } from '@/entities/expense-categories';
import { expensesQueryOptions } from '@/entities/expenses';
import { ManageExpenseCategoriesButton } from '@/features/manage-expense-categories';
import { useSelectedPeriod } from '@/features/select-period';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { getPercent } from '@/shared/lib/getPercent';
import { Card } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Skeleton } from '@/shared/ui/skeleton';
import { Body1 } from '@/shared/ui/typography';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import {
  useMemo,
  type FC,
} from 'react';

const locale = i18next.language;
const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

export const ExpensesByCategories: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: expensesData, isLoading: expensesLoading } = useQuery(
    expensesQueryOptions.findAll(selectedPeriod),
  );
  const { data: categories, isLoading: categoriesLoading } = useQuery(expenseCategoriesQueryOptions.findAll());
  const expensesByCategories = useMemo(() => (
    (expensesData?.items ?? [])
      .reduce<Record<string, number> & { total: number }>((acc, expense) => {
        const categoryId = expense.category._id;
        return {
          ...acc,
          [categoryId]: (acc[categoryId] ?? 0) + expense.amount,
          total: acc.total + expense.amount,
        };
      }, { total: 0 })
  ), [expensesData?.items]);
  const isLoading = expensesLoading || categoriesLoading;
  const contentClassName = !isLoading && !categories?.length
    ? 'flex grow items-center justify-center'
    : 'px-0';

  return (
    <Card.Base
      aria-busy={isLoading || undefined}
      className="h-fit min-h-56 w-full min-w-0 md:w-auto md:min-w-93"
    >
      {isLoading && <span className="sr-only">Загрузка...</span>}
      <Card.Header>
        <Card.Title>По категориям</Card.Title>
        <Card.Controls>
          <ManageExpenseCategoriesButton />
        </Card.Controls>
      </Card.Header>
      <Card.Content className={contentClassName}>
        {isLoading && ['first', 'second', 'third'].map((row) => (
          <div key={row} className="px-5 pb-5">
            <div className="mb-2 flex justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
        ))}
        {!isLoading && !categories?.length && (
          <Body1 className="text-muted-foreground">Данные отсутствуют</Body1>
        )}
        {!isLoading && categories?.map((category) => {
          const categoryExpenses = expensesByCategories[category._id] ?? 0;
          return (
            <div key={category._id} className="px-5 pb-5">
              <Progress.Root
                value={getPercent(
                  categoryExpenses,
                  expensesByCategories.total,
                  { multiplyBy100: true, useDiff: false },
                )}
                variant="danger"
              >
                <Progress.Label>{category.name}</Progress.Label>
                <Progress.Value>
                  {() => formatAmount.format(categoryExpenses)}
                </Progress.Value>
              </Progress.Root>
            </div>
          );
        })}
      </Card.Content>
    </Card.Base>
  );
};
