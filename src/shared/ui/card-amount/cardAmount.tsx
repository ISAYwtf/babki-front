import { getCurrentCurrencyCode } from '@/shared/lib/currency';
import { CardBase } from '@/shared/ui/card-base';
import type { ICardBaseProps } from '@/shared/ui/card-base/cardBase';
import { Icon } from '@/shared/ui/icon';
import { Stack } from '@/shared/ui/stack';
import { Body2 } from '@/shared/ui/typography/Body2';
import { SpecialBody1 } from '@/shared/ui/typography/SpecialBody1';
import { Title3 } from '@/shared/ui/typography/Title3';
import clsx from 'clsx';
import i18next from 'i18next';
import type { FC } from 'react';
import classes from './cardAmount.module.css';

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
  className,
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

  return (
    <CardBase {...htmlProps} className={clsx(classes.root)}>
      {title && <Title3 className={classes.title} color="label-secondary">{title}</Title3>}
      <Stack
        direction="row"
        justify="space-between"
        alignItems="end"
        gap="10px"
      >
        <SpecialBody1 title={value.toLocaleString()}>
          {formatAmount.format(value)}
        </SpecialBody1>
        {!!diff && (
          <Body2 color={isIncrease ? 'accent-green' : 'accent-red'}>
            {formatDiff.format(diff)}
            <Icon
              icon={isIncrease ? 'IcArrowUp10' : 'IcArrowDown10'}
              className={classes.diffIcon}
            />
          </Body2>
        )}
      </Stack>
    </CardBase>
  );
};
