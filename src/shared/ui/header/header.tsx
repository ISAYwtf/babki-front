import { Title1 } from '@/shared/ui/typography/Title1';
import { Title2 } from '@/shared/ui/typography/Title2';
import clsx from 'clsx';
import type {
  FC,
  HTMLProps,
} from 'react';
import classes from './header.module.css';

interface IHeaderProps extends HTMLProps<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export const Header: FC<IHeaderProps> = ({
  className, title, subtitle, ...htmlProps
}) => (
  <div {...htmlProps} className={clsx(classes.root, className)}>
    <Title1>
      {title}
      {' '}
      -
    </Title1>
    {subtitle && <Title2 className={classes.subtitle} color="label-secondary">{subtitle}</Title2>}
  </div>
);
