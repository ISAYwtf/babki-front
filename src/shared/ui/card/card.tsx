import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/shadcn-utils';
import { Typography } from '@/shared/ui/typography';

const CardBase = ({
  className,
  size = 'default',
  ...props
}: ComponentProps<'div'> & { size?: 'default' | 'sm' }) => (
  <div
    data-slot="card"
    data-size={size}
    className={cn(
      `
          group/card flex flex-col gap-4
          overflow-hidden rounded-lg bg-card
          py-4 text-sm text-card-foreground border
          data-[size=sm]:gap-3 data-[size=sm]:py-3
          has-data-[slot=card-header]:gap-7
        `,
      className,
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="card-header"
    className={cn(
      `
          group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-5
          group-data-[size=sm]/card:px-3
          has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]
          [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3
        `,
      className,
    )}
    {...props}
  />
);

const CardTitle = (props: Typography.IVariantProps) => (
  <Typography.Title1
    data-slot="card-title"
    {...props}
  />
);

const CardDescription = ({ className, ...props }: ComponentProps<'div'>) => (
  <Typography.Body3
    data-slot="card-description"
    className={cn('text-muted-foreground', className)}
    {...props}
  />
);

const CardControls = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="card-action"
    className={cn(
      'col-start-2 row-span-2 row-start-1 self-start justify-self-end flex gap-2',
      className,
    )}
    {...props}
  />
);

const CardContent = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="card-content"
    className={cn('px-5 group-data-[size=sm]/card:px-3', className)}
    {...props}
  />
);

export {
  CardBase,
  CardHeader,
  CardTitle,
  CardControls,
  CardDescription,
  CardContent,
};
