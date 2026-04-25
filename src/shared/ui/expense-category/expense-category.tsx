import { Caption1 } from '@/shared/ui/typography/typography';
import type { FC } from 'react';

interface IExpenseCategoryProps {
  children: string;
  color?: string;
}

export const ExpenseCategory: FC<IExpenseCategoryProps> = ({
  children,
  color,
}) => (
  <div
    className="flex gap-2 items-center rounded-full py-1 px-2.5 w-fit"
    style={{ backgroundColor: `rgb(from ${color} r g b / 0.2)` }}
  >
    <div className="rounded-full w-2 h-2" style={{ backgroundColor: color }} />
    <Caption1 style={{ color }}>
      {children}
    </Caption1>
  </div>
);
