import { cn } from '@/shared/lib/shadcn-utils';
import { Typography } from '@/shared/ui/typography';
import type { ComponentProps, FC } from 'react';

export interface InputProps extends ComponentProps<'input'> {
  hasError?: boolean;
}

const InputBase: FC<InputProps> = ({
  className,
  hasError = false,
  ...props
}) => (
  <input
    className={cn(
      `
        flex h-11 w-full rounded-lg border bg-background px-3 py-2 text-body-2
        transition-colors outline-none
        placeholder:text-muted-foreground
        focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30
        disabled:cursor-not-allowed disabled:opacity-50
      `,
      hasError && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
      className,
    )}
    {...props}
  />
);

const InputLabel = ({
  className,
  children,
  htmlFor,
  ...props
}: ComponentProps<'label'>) => (
  <label
    className={cn('mb-2 block', className)}
    htmlFor={htmlFor}
    {...props}
  >
    <Typography.Body2>{children}</Typography.Body2>
  </label>
);

const InputError = ({ className, ...props }: ComponentProps<'p'>) => (
  <Typography.Caption1 className={cn('mt-2 text-destructive', className)} {...props} />
);

export {
  InputBase,
  InputError,
  InputLabel,
};
