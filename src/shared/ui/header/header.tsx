import clsx from 'clsx';
import type {
  FC,
  HTMLProps,
  ReactNode,
} from 'react';
import { Typography } from '@/shared/ui/typography';

interface IHeaderProps extends HTMLProps<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const Header: FC<IHeaderProps> = ({
  actions, className, title, subtitle, ...htmlProps
}) => (
  <div
    {...htmlProps}
    className={clsx('flex w-full items-center justify-between gap-5 p-7', className)}
  >
    <div className="flex items-baseline">
      <Typography.Title1>
        {title}
        {' '}
        -
      </Typography.Title1>
      {subtitle && <Typography.Title2 className="ml-5 text-muted-foreground">{subtitle}</Typography.Title2>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
