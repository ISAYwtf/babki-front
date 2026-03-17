import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { CardBase } from '@/shared/ui/card-base';
import type { ICardBaseProps } from '@/shared/ui/card-base/cardBase';
import { Body2 } from '@/shared/ui/typography/Body2';
import { Title3 } from '@/shared/ui/typography/Title3';
import clsx from 'clsx';
import i18next from 'i18next';
import type { FC } from 'react';

export interface ICardListItem {
  title: string;
  value: number;
}

interface ICardListProps extends ICardBaseProps {
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
  <CardBase
    {...htmlProps}
    className={clsx('flex flex-col gap-6 max-w-xl p-3.5 w-2xs', htmlProps.className)}
  >
    {title && (
    <Title3
      className="text-muted-foreground uppercase"
    >
      {title}
    </Title3>
    )}
    <div className="flex flex-col gap-2.5">
      {items?.map((listItem, index) => (
        <div
          className="flex justify-between gap-2.5"
          key={index}
        >
          <Body2 className="text-accent-foreground">{listItem.title}</Body2>
          <Body2>{formatAmount.format(listItem.value)}</Body2>
        </div>
      ))}
    </div>
  </CardBase>
);
