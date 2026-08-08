import type { FC } from 'react';
import { Typography } from '@/shared/ui/typography';

interface ExpenseCategoryBadgeProps {
  children: string;
  color?: string;
}

export const ExpenseCategoryBadge: FC<ExpenseCategoryBadgeProps> = ({
  children,
  color,
}) => (
  <div
    className="flex min-w-0 max-w-full w-fit gap-2 items-center rounded-full py-1 px-2.5"
    style={{ backgroundColor: `rgb(from ${color} r g b / 0.2)` }}
  >
    <div className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
    <Typography.Caption1 className="truncate" style={{ color }}>
      {children}
    </Typography.Caption1>
  </div>
);
