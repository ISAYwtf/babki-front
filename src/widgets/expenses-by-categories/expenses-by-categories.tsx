import { expenseCategoriesQueryOptions } from '@/entities/expense-categories';
import { expensesQueryOptions } from '@/entities/expenses';
import { useSelectedPeriod } from '@/entities/period/hooks/useSelectedPeriod';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { getPercent } from '@/shared/lib/getPercent';
import { Card } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import {
  type FC,
  useMemo,
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

  if (expensesLoading || categoriesLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  if (!categories?.length) {
    return null;
  }

  return (
    <Card.Base className="h-fit min-w-93">
      <Card.Header>
        <Card.Title>По категориям</Card.Title>
      </Card.Header>
      <Card.Content className="px-0">
        {categories.map((category) => {
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
