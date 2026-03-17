import { CardBase } from '@/shared/ui/card-base';
import { Body2 } from '@/shared/ui/typography/Body2';
import { SpecialBody2 } from '@/shared/ui/typography/SpecialBody2';
import { Menu } from '@base-ui/react';
import { LucideChevronUp } from 'lucide-react';
import {
  type FC,
  useState,
} from 'react';
import classes from './changeYear.module.css';

const years = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
];

export const YearCard: FC = () => {
  const [selectedYear, setSelectedYear] = useState(years[0]);

  return (
    <CardBase className={classes.root}>
      <Menu.Root>
        <Menu.Trigger className={classes.trigger}>
          <SpecialBody2>
            {selectedYear.label}
            {' '}
            год
          </SpecialBody2>
          <LucideChevronUp className={classes.chevron} size={20} />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup className={classes.popup} render={<CardBase />}>
              <Menu.RadioGroup value={selectedYear} onValueChange={setSelectedYear}>
                {years.map((year) => (
                  <Menu.RadioItem
                    key={year.value}
                    value={year}
                    className={classes.popupItem}
                    render={<Body2 />}
                    closeOnClick
                  >
                    {year.label}
                    {' '}
                    год
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </CardBase>
  );
};
