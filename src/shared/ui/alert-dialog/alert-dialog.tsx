import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react';
import { cn } from '@/shared/lib/shadcn-utils';
import { Typography } from '@/shared/ui/typography';
import type {
  ComponentProps,
  FC,
} from 'react';

const AlertDialogBase = AlertDialogPrimitive.Root;
const AlertDialogClose = AlertDialogPrimitive.Close;

const AlertDialogContent: FC<ComponentProps<typeof AlertDialogPrimitive.Popup>> = ({
  className,
  children,
  ...props
}) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Backdrop
      className="
        fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px]
        data-ending-style:opacity-0 data-starting-style:opacity-0
        transition-opacity duration-200
      "
    />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <AlertDialogPrimitive.Popup
        className={cn(
          `
            w-full max-w-md rounded-xl border bg-card p-5 shadow-xl
            data-ending-style:scale-95 data-ending-style:opacity-0
            data-starting-style:scale-95 data-starting-style:opacity-0
            transition-all duration-200
          `,
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </div>
  </AlertDialogPrimitive.Portal>
);

const AlertDialogHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('flex items-start justify-between gap-4', className)} {...props} />
);

const AlertDialogBody = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('mt-5 flex flex-col gap-4', className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('mt-6 flex items-center justify-end gap-3', className)} {...props} />
);

const AlertDialogTitle = (props: Typography.IVariantProps) => (
  <AlertDialogPrimitive.Title
    render={<Typography.Title1 {...props} />}
  />
);

const AlertDialogDescription = ({ className, ...props }: ComponentProps<'p'>) => (
  <AlertDialogPrimitive.Description
    render={<Typography.Body3 className={cn('text-muted-foreground', className)} {...props} />}
  />
);

export {
  AlertDialogBase,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
};
