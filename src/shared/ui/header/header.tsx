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
    className={clsx(
      'flex w-full flex-wrap items-center justify-between gap-3 py-5 sm:gap-5 sm:py-7 lg:p-7',
      className,
    )}
  >
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 sm:gap-x-5">
      <Typography.Title1 className="shrink-0">
        {title}
        {' '}
        -
      </Typography.Title1>
      {subtitle && (
        <Typography.Title2 className="min-w-0 text-muted-foreground">
          {subtitle}
        </Typography.Title2>
      )}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
