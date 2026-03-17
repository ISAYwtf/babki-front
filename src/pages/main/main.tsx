import { YearCard } from '@/features/change-year/changeYear';
import { Card } from '@/shared/ui/card';
import { CardActionPanel } from '@/shared/ui/card/action-panel';
import { CardAmount } from '@/shared/ui/card-amount';
import { CardList } from '@/shared/ui/card-list';
import type { ICardListItem } from '@/shared/ui/card-list/cardList';
import { Header } from '@/shared/ui/header';
import { IconButton } from '@/shared/ui/icon-button';
import i18next from 'i18next';
import {
  LucidePencil,
  LucidePlus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

const MainPage = () => {
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
            <Card
              title="По месяцам"
              subtitle="Статистика по категориям добавленным в 2026г."
              actionPanel={(
                <CardActionPanel>
                  <IconButton><LucidePencil className="size-5" /></IconButton>
                  <IconButton><LucidePlus className="size-7" /></IconButton>
                </CardActionPanel>
              )}
            >
              sf
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
