import { YearCard } from '@/features/change-year/changeYear';
import { CardAmount } from '@/shared/ui/card-amount';
import { Grid } from '@/shared/ui/grid';
import { Header } from '@/shared/ui/header';
import { Stack } from '@/shared/ui/stack';
import { useTranslation } from 'react-i18next';
import classes from './main.module.css';

const MainPage = () => {
  const { t } = useTranslation();

  return (
    <Stack className={classes.root} gap="10px">
      <Header title={t('header.title')} subtitle={t('header.subtitle')} />
      <Stack
        direction="row"
        gap="20px"
      >
        <YearCard />
        <Grid
          gap="20px"
          cols={4}
          style={{ flexGrow: 1 }}
        >
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
        </Grid>
      </Stack>
    </Stack>
  );
};

export default MainPage;
