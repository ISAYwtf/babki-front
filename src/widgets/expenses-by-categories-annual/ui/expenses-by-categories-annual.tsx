import { expenseCategoriesQueryOptions } from '@/entities/expense-categories';
import { reportsQueryOptions } from '@/entities/reports';
import { usePeriodStore } from '@/features/select-period';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Chart } from '@/shared/ui/chart';
import type { ChartConfig } from '@/shared/ui/chart';
import { Skeleton } from '@/shared/ui/skeleton';
import { Body1 } from '@/shared/ui/typography';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { useMemo, type FC } from 'react';
import {
  Cell,
  Pie,
  PieChart,
} from 'recharts';

const locale = i18next.language;
const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export const ExpensesByAnnualCategories: FC = () => {
  const selectedYear = usePeriodStore((s) => s.selectedYear);

  const { data: yearlyReports, isLoading: reportsLoading } = useQuery(reportsQueryOptions.yearly());
  const { data: categories, isLoading: categoriesLoading } = useQuery(expenseCategoriesQueryOptions.findAll());

  const chartData = useMemo(() => {
    const yearEntry = yearlyReports?.find((r) => r.period === String(selectedYear));
    if (!yearEntry || !categories) return [];

    return yearEntry.expensesByCategory
      .filter((item) => item.total > 0)
      .map((item, index) => {
        const category = categories.find((c) => c._id === item.categoryId);
        return {
          id: item.categoryId,
          name: category?.name ?? item.categoryId,
          value: item.total,
          color: category?.color ?? CHART_COLORS[index % CHART_COLORS.length],
        };
      });
  }, [yearlyReports, categories, selectedYear]);

  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

  const chartConfig = useMemo<ChartConfig>(() => (
    Object.fromEntries(
      chartData.map((item) => [
        item.id,
        { label: item.name, color: item.color },
      ]),
    )
  ), [chartData]);

  if (reportsLoading || categoriesLoading) {
    return (
      <Card.Base aria-busy="true" className="h-fit w-full min-w-0 md:w-auto md:min-w-min">
        <span className="sr-only">Загрузка...</span>
        <Card.Header>
          <Card.Title>Расходы по категориям за год</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex h-72 w-full items-center justify-center md:w-75">
            <Skeleton className="size-52 rounded-full" />
          </div>
        </Card.Content>
      </Card.Base>
    );
  }

  if (!chartData.length) {
    return (
      <Card.Base className="h-fit w-full min-w-0 md:w-auto md:min-w-min">
        <Card.Header>
          <Card.Title>Расходы по категориям за год</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex h-72 w-full items-center justify-center md:w-75">
            <Body1 className="text-muted-foreground">Данные отсутствуют</Body1>
          </div>
        </Card.Content>
      </Card.Base>
    );
  }

  return (
    <Card.Base className="h-fit w-full min-w-0 md:w-auto md:min-w-min">
      <Card.Header>
        <Card.Title>Расходы по категориям за год</Card.Title>
      </Card.Header>
      <Card.Content>
        <Chart.Root config={chartConfig} className="relative h-72 w-full md:w-75">
          <PieChart>
            <Chart.Tooltip
              content={(
                <Chart.TooltipContent
                  hideLabel
                  valueFormatter={(value) => {
                    const n = Number(value);
                    return Number.isNaN(n) ? value : formatAmount.format(n);
                  }}
                />
              )}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              strokeWidth={2}
            >
              {chartData.map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
            </Pie>
            <Chart.Legend content={<Chart.LegendContent nameKey="name" />} />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-muted-foreground text-xs">Итого</span>
            <span className="font-semibold text-sm">{formatAmount.format(total)}</span>
          </div>
        </Chart.Root>
      </Card.Content>
    </Card.Base>
  );
};
