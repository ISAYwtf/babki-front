import { reportsQueryOptions } from '@/entities/reports';
import { usePeriodStore } from '@/entities/period';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Chart } from '@/shared/ui/chart';
import type { ChartConfig } from '@/shared/ui/chart/chart';
import { useQuery } from '@tanstack/react-query';
import { endOfMonth, endOfYear, format } from 'date-fns';
import i18next from 'i18next';
import { type FC, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  expenses: {
    label: 'Расходы',
    color: 'var(--chart-1)',
  },
  incomes: {
    label: 'Доходы',
    color: 'var(--chart-2)',
  },
  saving: {
    label: 'Накопления',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export const ExpensesByMonths: FC = () => {
  const selectedYear = usePeriodStore((s) => s.selectedYear);
  const selectedMonth = usePeriodStore((s) => s.selectedMonth);
  const currentYear = new Date().getFullYear();

  const periodQuery = useMemo(() => ({
    fromDate: format(new Date(selectedYear, 0, 1), 'yyyy-MM-dd'),
    toDate: selectedYear === currentYear
      ? format(endOfMonth(new Date(selectedYear, selectedMonth)), 'yyyy-MM-dd')
      : format(endOfYear(new Date(selectedYear, 11)), 'yyyy-MM-dd'),
  }), [selectedYear, selectedMonth, currentYear]);

  const { data: monthlyData, isLoading } = useQuery(
    reportsQueryOptions.monthly(periodQuery),
  );

  const chartData = useMemo(
    () => monthlyData?.map((item) => ({
      month: item.period,
      expenses: item.expenses,
      incomes: item.incomes,
      saving: item.saving,
    })) ?? [],
    [monthlyData],
  );

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  return (
    <Card.Base className="h-fit min-w-max">
      <Card.Header>
        <Card.Title>Расходы по месяцам</Card.Title>
      </Card.Header>
      <Card.Content>
        <Chart.Root className="h-92.5" config={chartConfig}>
          <BarChart data={chartData}>
            <Chart.Legend content={<Chart.LegendContent />} />
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => new Date(value).toLocaleDateString(locale, { month: 'short' })}
            />
            <Chart.Tooltip
              content={(
                <Chart.TooltipContent
                  valueFormatter={(value) => {
                    const numberValue = Number(value);
                    if (Number.isNaN(numberValue)) {
                      return value;
                    }

                    return formatAmount.format(numberValue);
                  }}
                />
              )}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={1}
              activeBar
            />
            <Bar
              dataKey="incomes"
              fill="var(--color-incomes)"
              radius={1}
              activeBar
            />
            <Bar
              dataKey="saving"
              fill="var(--color-saving)"
              radius={1}
              activeBar
            />
          </BarChart>
        </Chart.Root>
      </Card.Content>
    </Card.Base>
  );
};
