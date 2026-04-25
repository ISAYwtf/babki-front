import { debtsQueryOptions } from '@/entities/debts';
import { usersQueryOptions } from '@/entities/users';
import { CreateDebtButton } from '@/features/create-debt';
import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { env } from '@/shared/lib/env';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Table } from '@/shared/ui/table';
import {
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  format,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import i18next from 'i18next';
import {
  LucidePencil,
} from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const locale = i18next.language;
const formatAmount = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'standard',
});

export const Debts: FC = () => {
  const { data: userData } = useSuspenseQuery(usersQueryOptions.findOne(env.USER_ID));
  const { data: debtsData, isLoading } = useQuery(
    debtsQueryOptions.findAll(userData._id, { status: 'active', limit: 5 }),
  );
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }

  if (!debtsData?.items.length) {
    return null;
  }

  return (
    <Card.Base>
      <Card.Header>
        <Card.Title>{t('debts.title')}</Card.Title>
        <Card.Controls>
          <Button.Icon><LucidePencil className="size-5" /></Button.Icon>
          <CreateDebtButton userId={userData._id} />
        </Card.Controls>
      </Card.Header>
      <Card.Content className="px-0">
        <Table.Base>
          <Table.Body>
            {debtsData?.items.map(({
              _id, debtor, dueDate, remainingAmount,
            }) => (
              <Table.Row key={_id}>
                <Table.Cell>{debtor}</Table.Cell>
                <Table.Cell
                  className="text-body-2 text-muted-foreground"
                  title={dueDate && format(new Date(dueDate), 'P', { locale: ru })}
                >
                  {dueDate && format(new Date(dueDate), 'LLLL d, y', { locale: ru })}
                </Table.Cell>
                <Table.Cell className="text-right">{formatAmount.format(remainingAmount)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Base>
      </Card.Content>
    </Card.Base>
  );
};
