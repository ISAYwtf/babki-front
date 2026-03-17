import { CardBase } from '@/shared/ui/card-base';
import type { ICardBaseProps } from '@/shared/ui/card-base/cardBase';
import { Body3 } from '@/shared/ui/typography/Body3';
import { Title1 } from '@/shared/ui/typography/Title1';
import clsx from 'clsx';
import type {
  FC,
  ReactNode,
} from 'react';

interface ICardProps extends ICardBaseProps {
  title?: string;
  subtitle?: string;
  actionPanel?: ReactNode;
}

export const Card: FC<ICardProps> = ({
  title,
  subtitle,
  children,
  actionPanel,
  ...htmlProps
}) => (
  <CardBase {...htmlProps} className={clsx('flex flex-col gap-7 py-4 px-5', htmlProps.className)}>
    <div className="flex gap-5 justify-between">
      <div className="flex flex-col gap-1">
        {title && <Title1>{title}</Title1>}
        {subtitle && <Body3 className="text-muted-foreground">{subtitle}</Body3>}
      </div>
      {actionPanel}
    </div>
    {children}
  </CardBase>
);
