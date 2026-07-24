import { expensesQueryOptions } from '@/entities/expenses';
import { useSelectedPeriod } from '@/features/select-period';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Chart } from '@/shared/ui/chart';
import type { ChartConfig } from '@/shared/ui/chart';
import { Skeleton } from '@/shared/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { isAfter } from 'date-fns';
import i18next from 'i18next';
import {
  useMemo,
  type FC,
} from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from 'recharts';

const locale = i18next.language;
const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

const chartConfig = {
  amount: {
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export const ExpensesByDays: FC = () => {
  const selectedPeriod = useSelectedPeriod();
  const { data: expensesData, isLoading: expensesLoading } = useQuery(
    expensesQueryOptions.findAll(selectedPeriod),
  );
  const expensesByDate = useMemo(() => expensesData?.items.map((expense) => ({
    date: expense.transactionDate,
    amount: expense.amount,
  })).sort((a, b) => (isAfter(a.date, b.date) ? 1 : -1)), [expensesData?.items]);

  if (expensesLoading) {
    return (
      <Card.Base aria-busy="true" className="h-fit min-w-max w-200">
        <span className="sr-only">Загрузка...</span>
        <Card.Header>
          <Card.Title>Расходы по дням</Card.Title>
        </Card.Header>
        <Card.Content>
          <Skeleton className="aspect-video w-full" />
        </Card.Content>
      </Card.Base>
    );
  }

  return (
    <Card.Base className="h-fit min-w-max w-200">
      <Card.Header>
        <Card.Title>Расходы по дням</Card.Title>
      </Card.Header>
      <Card.Content>
        <Chart.Root config={chartConfig}>
          <LineChart data={expensesByDate}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <Chart.Tooltip
              content={(
                <Chart.TooltipContent
                  nameKey="amount"
                  labelFormatter={(value) => new Date(String(value)).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  formatter={(value) => {
                    const numberValue = Number(value);
                    if (Number.isNaN(numberValue)) {
                      return value;
                    }

                    return formatAmount.format(numberValue);
                  }}
                />
              )}
            />
            <Line
              dataKey="amount"
              type="monotone"
              stroke="var(--color-amount)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </Chart.Root>
      </Card.Content>
    </Card.Base>
  );
};
