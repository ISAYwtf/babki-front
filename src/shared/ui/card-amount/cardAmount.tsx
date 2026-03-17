import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { CardBase } from '@/shared/ui/card-base';
import type { ICardBaseProps } from '@/shared/ui/card-base/cardBase';
import { Body2 } from '@/shared/ui/typography/Body2';
import { SpecialBody1 } from '@/shared/ui/typography/SpecialBody1';
import { Title3 } from '@/shared/ui/typography/Title3';
import clsx from 'clsx';
import i18next from 'i18next';
import {
  LucideArrowDown,
  LucideArrowUp,
} from 'lucide-react';
import type { FC } from 'react';

type CurrencyType = string;
type DiffStyleType = 'percent' | 'currency';

interface ICardAmountProps extends ICardBaseProps {
  title?: string;
  value: number;
  currency?: CurrencyType;
  diff?: number;
  diffStyle?: DiffStyleType;
}

export const CardAmount: FC<ICardAmountProps> = ({
  children,
  title,
  value,
  currency: externalCurrency,
  diff,
  diffStyle = 'percent',
  ...htmlProps
}) => {
  const locale = i18next.language;
  const currency = externalCurrency ?? getCurrentCurrencyCode();
  const isIncrease = !!diff && diff > 0;

  const formatAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
  });

  const formatDiff = new Intl.NumberFormat(locale, {
    style: diffStyle,
    currency,
    signDisplay: 'exceptZero',
    notation: 'compact',
  });

  const DiffIcon = isIncrease ? LucideArrowUp : LucideArrowDown;

  return (
    <CardBase {...htmlProps} className={clsx('flex flex-col gap-2.5 max-w-xl p-3.5', htmlProps.className)}>
      {title && (
      <Title3 className="text-muted-foreground uppercase">
        {title}
      </Title3>
      )}
      <div className="flex justify-between items-end gap-2.5">
        <SpecialBody1 title={value.toLocaleString()}>
          {formatAmount.format(value)}
        </SpecialBody1>
        {!!diff && (
          <Body2 className={clsx('flex items-center', isIncrease ? 'text-success' : 'text-destructive')}>
            {formatDiff.format(diff)}
            <DiffIcon
              className="ml-1 size-4"
              strokeWidth={1.75}
            />
          </Body2>
        )}
      </div>
    </CardBase>
  );
};
