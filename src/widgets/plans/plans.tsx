import { plansQueryOptions } from '@/entities/plans';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Table } from '@/shared/ui/table';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { LucidePencil, LucidePlus } from 'lucide-react';
import { type FC } from 'react';

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

  return (
    <Card.Base>
      <Card.Header>
        <Card.Title>Планирование</Card.Title>
        <Card.Controls>
          <Button.Icon><LucidePencil className="size-5" /></Button.Icon>
          <Button.Icon><LucidePlus className="size-7" /></Button.Icon>
        </Card.Controls>
      </Card.Header>
      <Card.Content className="px-0">
        {isLoading && <div className="px-5 py-3 text-muted-foreground">Загрузка...</div>}
        {!isLoading && !data?.items.length && (
          <div className="px-5 py-3 text-muted-foreground">Нет активных планов</div>
        )}
        {!isLoading && !!data?.items.length && (
          <Table.Base>
            <Table.Body>
              {data.items.map((plan) => (
                <Table.Row key={plan._id}>
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
    </Card.Base>
  );
};
