import { usersQueryOptions } from '@/entities/users';
import { Debts } from '@/widgets/debts';
import { ExpensesByCategories } from '@/widgets/expenses-by-categories';
import { ExpenseLimits } from '@/widgets/expense-limits';
import { Expenses } from '@/widgets/expenses';
import { ExpensesByDays } from '@/widgets/expenses-by-days';
import { Incomes } from '@/widgets/incomes';
import { LastYearRest } from '@/widgets/last-year-rest';
import { Savings } from '@/widgets/savings';
import { Balance } from '@/widgets/balance';
import { YearExpenses } from '@/widgets/year-expenses';
import { YearIncomes } from '@/widgets/year-incomes';
import { YearSavings } from '@/widgets/year-savings';
import { createFileRoute } from '@tanstack/react-router';
import { YearSwitcher } from '@/features/change-year/year-switcher';
import { MonthSwitcher } from '@/features/change-month';
import { Header } from '@/shared/ui/header';
import { Button } from '@/shared/ui/button';
import { LucidePencil, LucidePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { Table } from '@/shared/ui/table';

function MainPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5">
      <Header title={t('header.title')} subtitle={t('header.subtitle')} />

      <div className="flex flex-col gap-5">
        <div className="flex gap-5">

          <div className="flex flex-col gap-5">
            <YearSwitcher />
            <LastYearRest />
            <YearSavings />
            <YearIncomes />
            <YearExpenses />
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

        <div className="grid gap-2.5 grid-cols-[1fr_minmax(auto,400px)] overflow-scroll no-scrollbar">
          <ExpensesByDays />
          <div className="flex gap-2.5">
            <ExpensesByCategories />
            <ExpenseLimits />
          </div>
        </div>
        <div className="grid gap-2.5 grid-cols-[1fr_minmax(auto,400px)]">
          <Expenses />
          <div className="flex flex-col gap-2.5">
            <Balance />
            <Incomes />
            <Savings />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/main')({
  loader: ({ context }) => (
    context.queryClient.ensureQueryData(usersQueryOptions.me())
  ),
  component: MainPage,
});
