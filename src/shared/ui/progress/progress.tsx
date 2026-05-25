import { cn } from '@/shared/lib/shadcn-utils';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';
import { Typography } from '../typography';

const ProgressLabel = (props: ProgressPrimitive.Label.Props) => (
  <ProgressPrimitive.Label
    data-slot="progress-label"
    render={<Typography.Body2 />}
    {...props}
  />
);

const ProgressValue = ({ className, ...props }: ProgressPrimitive.Value.Props) => (
  <ProgressPrimitive.Value
    className={cn(
      'ml-auto tabular-nums',
      className,
    )}
    render={<Typography.Body2 />}
    data-slot="progress-value"
    {...props}
  />
);

const ProgressIndicator = ({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) => (
  <ProgressPrimitive.Indicator
    data-slot="progress-indicator"
    className={cn('h-full bg-primary transition-all rounded-full', className)}
    {...props}
  />
);

const ProgressTrack = ({ className, ...props }: ProgressPrimitive.Track.Props) => (
  <ProgressPrimitive.Track
    className={cn(
      'relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted',
      className,
    )}
    data-slot="progress-track"
    {...props}
  />
);

const Progress = ({
  className,
  children,
  value,
  variant = 'secondary',
  ...props
}: ProgressPrimitive.Root.Props & { variant?: 'success' | 'danger' | 'secondary' }) => (
  <ProgressPrimitive.Root
    value={value}
    data-slot="progress"
    data-variant={variant}
    className={cn('flex flex-wrap gap-2', className)}
    {...props}
  >
    {children}
    <ProgressTrack data-variant={variant}>
      <ProgressIndicator className="in-data-[variant=success]:bg-success in-data-[variant=danger]:bg-destructive" />
    </ProgressTrack>
  </ProgressPrimitive.Root>
);

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
