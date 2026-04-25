import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/shadcn-utils';

export const TableBase = ({ className, ...props }: ComponentProps<'div'>) => (
  <div data-slot="table-container" className={cn('relative w-full overflow-x-auto', className)}>
    <div
      data-slot="table"
      className="table w-full caption-bottom text-body-1 border-collapse"
      {...props}
    />
  </div>
);

export const TableHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="table-header"
    className={cn('table-header-group [&_tr]:border-b', className)}
    {...props}
  />
);

export const TableBody = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="table-body"
    className={cn('table-row-group', className)}
    {...props}
  />
);

export const TableFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="table-footer"
    className={cn('table-footer-group bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
);

export const TableRow = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="table-row"
    className={cn(`
      table-row border-b last-of-type:border-0
      hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors
    `, className)}
    {...props}
  />
);

export const TableHead = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="table-head"
    className={cn(`
      table-cell text-foreground h-10 px-5 text-left align-middle
      font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0
    `, className)}
    {...props}
  />
);

export const TableCell = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="table-cell"
    className={cn('table-cell p-5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
);

export const TableCaption = ({
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    data-slot="table-caption"
    className={cn('table-caption text-muted-foreground mt-4 text-sm', className)}
    {...props}
  />
);
