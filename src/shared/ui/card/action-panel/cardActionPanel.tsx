import type { IStackProps } from '@/shared/ui/stack/stack';
import { clsx } from 'clsx';
import type { FC } from 'react';

type ICardActionPanelProps = IStackProps;

export const CardActionPanel: FC<ICardActionPanelProps> = ({
  children,
  className,
  ...htmlProps
}) => (
  <div
    className={clsx('flex gap-2', className)}
    {...htmlProps}
  >
    {children}
  </div>
);
