import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '@/shared/lib/shadcn-utils';
import styles from './horizontal-scroller.module.css';

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
}: HorizontalScrollerProps) => (
  <div
    className={cn(
      styles.viewport,
      className,
    )}
    data-bleed={bleed}
    data-hide-scrollbar={!showScrollbar}
    data-slot="horizontal-scroller"
    style={style}
    {...props}
  >
    <div
      className={cn(styles.track, trackClassName)}
      data-slot="horizontal-scroller-track"
      style={trackStyle}
    >
      {children}
    </div>
  </div>
);
