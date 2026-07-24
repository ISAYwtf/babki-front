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
    className="flex gap-2 items-center rounded-full py-1 px-2.5 w-fit"
    style={{ backgroundColor: `rgb(from ${color} r g b / 0.2)` }}
  >
    <div className="rounded-full w-2 h-2" style={{ backgroundColor: color }} />
    <Typography.Caption1 style={{ color }}>
      {children}
    </Typography.Caption1>
  </div>
);
