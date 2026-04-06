import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { Card } from '@/shared/ui/card';
import { Typography } from '@/shared/ui/typography';
import clsx from 'clsx';
import i18next from 'i18next';
import type {
  ComponentProps,
  FC,
} from 'react';

export interface ICardListItem {
  title: string;
  value: number;
}

interface ICardListProps extends ComponentProps<typeof Card.Base> {
  title: string;
  items: ICardListItem[];
}

const formatAmount = new Intl.NumberFormat(i18next.language, {
  style: 'currency',
  currency: getCurrentCurrencyCode(),
  notation: 'compact',
  compactDisplay: 'short',
});

export const CardList: FC<ICardListProps> = ({
  title,
  items,
  ...htmlProps
}) => (
  <Card.Base
    {...htmlProps}
    className={clsx('gap-6 max-w-xl p-3.5 w-2xs', htmlProps.className)}
  >
    {title && (
      <Typography.Title3
        data-slot="card-title"
        className="text-muted-foreground uppercase"
      >
        {title}
      </Typography.Title3>
    )}
    <div className="flex flex-col gap-2.5">
      {items?.map((listItem, index) => (
        <div
          className="flex justify-between gap-2.5"
          key={index}
        >
          <Typography.Body2 className="text-accent-foreground">{listItem.title}</Typography.Body2>
          <Typography.Body2>{formatAmount.format(listItem.value)}</Typography.Body2>
        </div>
      ))}
    </div>
  </Card.Base>
);
