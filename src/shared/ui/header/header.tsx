import { Title1 } from '@/shared/ui/typography/Title1';
import { Title2 } from '@/shared/ui/typography/Title2';
import clsx from 'clsx';
import type {
  FC,
  HTMLProps,
} from 'react';

interface IHeaderProps extends HTMLProps<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export const Header: FC<IHeaderProps> = ({
  className, title, subtitle, ...htmlProps
}) => (
  <div {...htmlProps} className={clsx('flex p-7 mx-auto mt-10 mb-2.5 w-fit', className)}>
    <Title1>
      {title}
      {' '}
      -
    </Title1>
    {subtitle && <Title2 className="text-muted-foreground ml-5">{subtitle}</Title2>}
  </div>
);
