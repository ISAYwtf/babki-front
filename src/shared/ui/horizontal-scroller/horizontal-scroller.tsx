import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '@/shared/lib/shadcn-utils';

export type HorizontalScrollerProps = ComponentProps<'div'> & {
  bleed?: 'none' | 'viewport-start' | 'viewport-end' | 'viewport-both';
  showScrollbar?: boolean;
  trackClassName?: string;
  trackStyle?: CSSProperties;
};

export const HorizontalScroller = ({
  bleed = 'none',
  children,
  className,
  showScrollbar = false,
  style,
  trackClassName,
  trackStyle,
  ...props
}: HorizontalScrollerProps) => {
  const bleedsFromStart = bleed === 'viewport-start' || bleed === 'viewport-both';
  const bleedsToEnd = bleed === 'viewport-end' || bleed === 'viewport-both';
  const viewportBleed = 'var(--viewport-inline-bleed, 0px)';

  return (
    <div
      className={cn(
        'min-w-0 overflow-x-auto overscroll-x-contain',
        !showScrollbar && '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      data-bleed={bleed}
      data-slot="horizontal-scroller"
      style={{
        marginInlineStart: bleedsFromStart
          ? `calc(-1 * ${viewportBleed})`
          : undefined,
        width: bleedsFromStart && bleedsToEnd
          ? `calc(100% + ${viewportBleed} + ${viewportBleed})`
          : bleedsFromStart || bleedsToEnd
            ? `calc(100% + ${viewportBleed})`
            : undefined,
        ...style,
      }}
      {...props}
    >
      <div
        className={cn('flex w-max [&>*]:shrink-0', trackClassName)}
        data-slot="horizontal-scroller-track"
        style={{
          paddingInlineStart: bleedsFromStart ? viewportBleed : undefined,
          paddingInlineEnd: bleedsToEnd ? viewportBleed : undefined,
          ...trackStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};
