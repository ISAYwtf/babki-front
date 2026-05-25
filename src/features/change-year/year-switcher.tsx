import { usePeriodStore } from '@/entities/period';
import { Card } from '@/shared/ui/card';
import { Typography } from '@/shared/ui/typography';
import { Menu } from '@base-ui/react';
import { LucideChevronUp } from 'lucide-react';
import { type FC } from 'react';
import classes from './year-switcher.module.css';

interface YearSwitcherViewProps {
  value: number;
  onChange?: (value: number) => void;
  allowedYears: number[];
}

const YearSwitcherView: FC<YearSwitcherViewProps> = ({
  value,
  onChange,
  allowedYears = [],
}) => (
  <Card.Base className="flex w-2xs py-5 px-4">
    <Menu.Root>
      <Menu.Trigger className={classes.trigger}>
        <Typography.SpecialBody2>
          {value}
          {' '}
          год
        </Typography.SpecialBody2>
        <LucideChevronUp className="transition-transform duration-100" size={20} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup className="flex flex-col rounded-t-none border-t-0 w-2xs p-1" render={<Card.Base />}>
            <Menu.RadioGroup value={value} onValueChange={onChange}>
              {allowedYears.map((year) => (
                <Menu.RadioItem
                  key={year}
                  value={year}
                  className={classes.popupItem}
                  render={<Typography.Body2 />}
                  closeOnClick
                >
                  {year}
                  {' '}
                  год
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  </Card.Base>
);

export const YearSwitcher: FC = () => {
  // TODO Брать из АПИ
  const allowedYears = [2026, 2025, 2024, 2023];
  const selectedYear = usePeriodStore((state) => state.selectedYear);
  const setSelectedYear = usePeriodStore((state) => state.setSelectedYear);

  return (
    <YearSwitcherView
      value={selectedYear}
      onChange={setSelectedYear}
      allowedYears={allowedYears}
    />
  );
};
