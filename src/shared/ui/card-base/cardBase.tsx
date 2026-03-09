import clsx from 'clsx';
import type {
  FC,
  HTMLProps,
} from 'react';
import classes from './cardBase.module.css';

export type ICardBaseProps = HTMLProps<HTMLDivElement>;

export const CardBase: FC<ICardBaseProps> = ({ className, ...htmlProps }) => (
  <div {...htmlProps} className={clsx(classes.root, className)} />
);
