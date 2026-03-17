import clsx from 'clsx';
import type {
  FC,
  HTMLProps,
} from 'react';

export type ICardBaseProps = HTMLProps<HTMLDivElement>;

export const CardBase: FC<ICardBaseProps> = ({ className, ...htmlProps }) => (
  <div {...htmlProps} className={clsx('bg-card rounded-lg border', className)} />
);
