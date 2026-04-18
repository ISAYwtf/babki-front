import { usersQueryOptions } from '@/entities/users';
import { env } from '@/shared/lib/env';
import { Debts } from '@/widgets/debts';
import { createFileRoute } from '@tanstack/react-router';
import { YearCard } from '@/features/change-year/changeYear';
import {
  MonthSwitcher,
} from '@/features/change-month';
import { CardAmount } from '@/shared/ui/card-amount';
import {
  CardList,
  type ICardListItem,
} from '@/shared/ui/card-list';
import { Header } from '@/shared/ui/header';
import { Button } from '@/shared/ui/button';
import i18next from 'i18next';
import {
  LucidePencil,
  LucidePlus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { Table } from '@/shared/ui/table';

const lastYearRestItems: ICardListItem[] = [
  { title: i18next.t('fromLastYear.rest'), value: 0 },
  { title: i18next.t('fromLastYear.savings'), value: 103_500 },
];

const incomeExpenseItems: ICardListItem[] = [
  { title: i18next.t('incomeExpense.income'), value: 0 },
  { title: i18next.t('incomeExpense.expenses'), value: 500 },
  { title: i18next.t('incomeExpense.savings'), value: 1_000 },
  { title: i18next.t('incomeExpense.debtCollection'), value: 100 },
];

function MainPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5">
      <Header title={t('header.title')} subtitle={t('header.subtitle')} />
      <div className="flex flex-col gap-5">
        <div className="flex gap-5">
          <YearCard />
          <div className="grid gap-5 grow grid-cols-4">
            <CardAmount
              title={t('expensesFromReceipts.title')}
              value={1_000_000}
              diff={0.36}
            />
            <CardAmount
              title={t('incomes.title')}
              value={0}
              diff={0.36}
            />
            <CardAmount
              title={t('savings.title')}
              value={0}
              diff={-0.36}
            />
            <CardAmount
              title={t('expenses.title')}
              value={0}
              diff={-0.36}
            />
          </div>
        </div>
        <div className="flex gap-5">
          <div className="flex flex-col gap-5">
            <CardList title={t('fromLastYear.title')} items={lastYearRestItems} />
            <CardList title={t('incomeExpense.title')} items={incomeExpenseItems} />
          </div>
          <div className="flex flex-col gap-5">
            <div className="grid grid-flow-col-dense gap-5">
              <Card.Base>
                <Card.Header>
                  <Card.Title>По месяцам</Card.Title>
                  <Card.Controls>
                    <Button.Icon><LucidePencil className="size-5" /></Button.Icon>
                    <Button.Icon><LucidePlus className="size-7" /></Button.Icon>
                  </Card.Controls>
                </Card.Header>
                <Card.Content>
                  <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi aperiam commodi in nihil quis
                    soluta tempora veniam vitae! Amet animi atque cum ea esse nam quaerat quam unde ut veritatis.
                  </div>
                  <div>
                    Accusantium, aliquid autem blanditiis consequatur deserunt ea eos et, excepturi expedita facere
                    fugit magni maxime modi molestiae non odio porro possimus quae, quo quod reiciendis repellendus
                    suscipit totam voluptatem voluptatibus?
                  </div>
                </Card.Content>
              </Card.Base>
              <Card.Base>
                <Card.Header>
                  <Card.Title>По месяцам</Card.Title>
                  <Card.Controls>
                    <Button.Icon><LucidePencil className="size-5" /></Button.Icon>
                    <Button.Icon><LucidePlus className="size-7" /></Button.Icon>
                  </Card.Controls>
                </Card.Header>
                <Card.Content className="px-0">
                  <Table.Base>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>Стиральная машина</Table.Cell>
                        <Table.Cell className="text-muted-foreground text-body-2">март 20, 2026</Table.Cell>
                        <Table.Cell className="text-right">₽ 25 000</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Холодильник</Table.Cell>
                        <Table.Cell className="text-muted-foreground text-body-2">март 20, 2026</Table.Cell>
                        <Table.Cell className="text-right">₽ 25 000</Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell>Холодильник</Table.Cell>
                        <Table.Cell className="text-muted-foreground text-body-2">март 20, 2026</Table.Cell>
                        <Table.Cell className="text-right">₽ 25 000</Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table.Base>
                </Card.Content>
              </Card.Base>
            </div>
            <div className="grid grid-flow-col-dense gap-5">
              <Debts />
            </div>
          </div>
        </div>
        <MonthSwitcher />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/main')({
  loader: ({ context }) => (
    context.queryClient.ensureQueryData(usersQueryOptions.findOne(env.USER_ID))
  ),
  component: MainPage,
});
