import { Card } from '@/shared/ui/card';
import { Typography } from '@/shared/ui/typography';
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
    <Card.Base className="flex w-2xs py-5 px-4">
      <Menu.Root>
        <Menu.Trigger className={classes.trigger}>
          <Typography.SpecialBody2>
            {selectedYear.label}
            {' '}
            год
          </Typography.SpecialBody2>
          <LucideChevronUp className={classes.chevron} size={20} />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup className="flex flex-col rounded-t-none border-t-0 w-2xs p-1" render={<Card.Base />}>
              <Menu.RadioGroup value={selectedYear} onValueChange={setSelectedYear}>
                {years.map((year) => (
                  <Menu.RadioItem
                    key={year.value}
                    value={year}
                    className={classes.popupItem}
                    render={<Typography.Body2 />}
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
    </Card.Base>
  );
};
