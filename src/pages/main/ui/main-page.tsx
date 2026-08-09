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
import { MonthSwitcher, YearSwitcher } from '@/features/select-period';
import { LogoutButton } from '@/features/auth';
import { Header } from '@/shared/ui/header';
import { HorizontalScroller } from '@/shared/ui/horizontal-scroller';
import { useTranslation } from 'react-i18next';

export function MainPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5">
      <Header
        title={t('header.title')}
        subtitle={t('header.subtitle')}
        actions={<LogoutButton />}
      />

      <div className="flex flex-col gap-5">
        <div className="flex gap-5">

          <div className="flex flex-col gap-5">
            <YearSwitcher />
            <LastYearRest />
            <YearSavings />
            <YearIncomes />
            <YearExpenses />
          </div>

          <div className="flex min-w-0 grow flex-col gap-5">
            <HorizontalScroller
              aria-label="Годовые отчёты"
              bleed="viewport-end"
              role="region"
              trackClassName="gap-5 pb-2"
            >
              <ExpensesByMonths />
              <ExpensesByAnnualCategories />
            </HorizontalScroller>
            <div className="grid grid-flow-col-dense gap-5">
              <Plans />
              <Debts />
            </div>
          </div>
        </div>

        <MonthSwitcher />

        <HorizontalScroller
          aria-label="Отчёты за месяц"
          bleed="viewport-both"
          role="region"
          trackClassName="gap-2.5 pb-2"
        >
          <ExpensesByDays />
          <ExpensesByCategories />
          <ExpenseLimits />
        </HorizontalScroller>
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
