import { usersQueryOptions } from '@/entities/users';
import { Debts } from '@/widgets/debts';
import { ExpensesByCategories } from '@/widgets/expenses-by-categories';
import { ExpenseLimits } from '@/widgets/expense-limits';
import { Expenses } from '@/widgets/expenses';
import { ExpensesByDays } from '@/widgets/expenses-by-days';
import { ExpensesByMonths } from '@/widgets/expenses-by-months';
import { ExpensesByAnnualCategories } from '@/widgets/expenses-by-categories-annual';
import { Incomes } from '@/widgets/incomes';
import { LastYearRest } from '@/widgets/last-year-rest';
import { Plans } from '@/widgets/plans';
import { Savings } from '@/widgets/savings';
import { Balance } from '@/widgets/balance';
import { YearExpenses } from '@/widgets/year-expenses';
import { YearIncomes } from '@/widgets/year-incomes';
import { YearSavings } from '@/widgets/year-savings';
import { createFileRoute } from '@tanstack/react-router';
import { YearSwitcher } from '@/features/change-year/year-switcher';
import { MonthSwitcher } from '@/features/change-month';
import { Header } from '@/shared/ui/header';
import { useTranslation } from 'react-i18next';

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

          <div className="flex flex-col grow gap-5 overflow-hidden">
            <div className="flex gap-5 overflow-scroll">
              <ExpensesByMonths />
              <ExpensesByAnnualCategories />
            </div>
            <div className="grid grid-flow-col-dense gap-5">
              <Plans />
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
