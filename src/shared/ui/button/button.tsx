import { Button as ButtonPrimitive } from '@base-ui/react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/shadcn-utils';
import { buttonVariants } from './variants';

export const Button = ({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => (
  <ButtonPrimitive
    data-slot="button"
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
);
