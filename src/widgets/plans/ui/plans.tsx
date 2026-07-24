import { plansQueryOptions, type Plan } from '@/entities/plans';
import { CreatePlanButton } from '@/features/create-plan';
import { PlanDetailsDialog } from '@/features/manage-plan';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table } from '@/shared/ui/table';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { type FC, useState } from 'react';

const locale = i18next.language;

const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
  minimumFractionDigits: 0,
});

const formatDate = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const Plans: FC = () => {
  const { data, isLoading } = useQuery(
    plansQueryOptions.findAll({ status: 'active', limit: 100 }),
  );
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <Card.Base aria-busy={isLoading} className="min-h-64">
      {isLoading && <span className="sr-only">Загрузка...</span>}
      <Card.Header>
        <Card.Title>Планирование</Card.Title>
        <Card.Controls>
          <CreatePlanButton />
        </Card.Controls>
      </Card.Header>
      <Card.Content className="px-0">
        {isLoading && (
          <Table.Base>
            <Table.Body>
              {['first', 'second', 'third'].map((row) => (
                <Table.Row key={row}>
                  <Table.Cell><Skeleton className="h-4 w-32" /></Table.Cell>
                  <Table.Cell><Skeleton className="h-4 w-24" /></Table.Cell>
                  <Table.Cell><Skeleton className="ml-auto h-4 w-20" /></Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Base>
        )}
        {!isLoading && !data?.items.length && (
          <div className="flex min-h-36 items-center justify-center px-5 py-3 text-muted-foreground">
            Нет активных планов
          </div>
        )}
        {!isLoading && !!data?.items.length && (
          <Table.Base>
            <Table.Body>
              {data.items.map((plan) => (
                <Table.Row
                  key={plan._id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-muted"
                  onClick={() => setSelectedPlan(plan)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedPlan(plan);
                    }
                  }}
                >
                  <Table.Cell>{plan.description}</Table.Cell>
                  <Table.Cell className="text-muted-foreground text-body-2">
                    {formatDate.format(new Date(plan.targetDate))}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {formatAmount.format(plan.amount)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Base>
        )}
      </Card.Content>

      <PlanDetailsDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
    </Card.Base>
  );
};
