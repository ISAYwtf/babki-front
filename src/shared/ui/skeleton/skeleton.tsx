import { cn } from '@/shared/lib/shadcn-utils';
import type { ComponentProps, FC } from 'react';

export const Skeleton: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div
    {...props}
    aria-hidden="true"
    data-slot="skeleton"
    className={cn('animate-pulse rounded-md bg-muted motion-reduce:animate-none', className)}
  />
);
