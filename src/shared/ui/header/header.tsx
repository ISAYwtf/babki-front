import clsx from 'clsx';
import type {
  FC,
  HTMLProps,
} from 'react';
import { Typography } from '@/shared/ui/typography';

interface IHeaderProps extends HTMLProps<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export const Header: FC<IHeaderProps> = ({
  className, title, subtitle, ...htmlProps
}) => (
  <div {...htmlProps} className={clsx('flex p-7 mx-auto mt-10 mb-2.5 w-fit', className)}>
    <Typography.Title1>
      {title}
      {' '}
      -
    </Typography.Title1>
    {subtitle && <Typography.Title2 className="text-muted-foreground ml-5">{subtitle}</Typography.Title2>}
  </div>
);
