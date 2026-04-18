import {
  FIRST_MONTH_INDEX,
  LAST_MONTH_INDEX,
  MONTHS,
  useMonthStore,
} from '@/entities/month';
import { formatMonthIndex } from '@/shared/lib/i18n/date-fns';
import {
  LucideChevronLeft,
  LucideChevronRight,
} from 'lucide-react';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/Draggable';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/shared/ui/typography';
import { Button } from '@/shared/ui/button';

gsap.registerPlugin(useGSAP, Draggable);

interface DraggableSnapScrollProps {
  value: number;
  onChange?: (index: number) => void;
}

const BUTTON_WIDTH = 140;

const MonthSwitcherView: React.FC<DraggableSnapScrollProps> = ({
  value,
  onChange,
}) => {
  const { i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const snapPointsRef = useRef<number[]>([]);

  const setSelectedIndex = (index: number) => {
    onChange?.(index);
  };

  const calculateSnapPoints = (): number[] => {
    const container = containerRef.current;
    const buttons = buttonsRef.current.filter((btn): btn is HTMLButtonElement => btn !== null);
    if (!container || buttons.length === 0) return [];

    const containerWidth = container.offsetWidth;
    const containerCenter = containerWidth / 2;

    return buttons.map((btn) => {
      const btnCenter = btn.offsetLeft + BUTTON_WIDTH / 2;
      return containerCenter - btnCenter;
    });
  };

  const getClosestIndex = (point: number) => {
    const snappedValue = gsap.utils.snap(snapPointsRef.current, point);
    return snapPointsRef.current.indexOf(snappedValue) ?? 0;
  };

  const getTrackBounds = () => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return { minX: 0 };

    // Границы перетаскивания (чтобы крайние кнопки могли центрироваться)
    const containerWidth = container.offsetWidth;
    const trackScrollWidth = track.scrollWidth;
    const edgeOffset = (containerWidth - BUTTON_WIDTH) / 2;
    const maxX = edgeOffset;
    const minX = -(trackScrollWidth - containerWidth + edgeOffset);

    return {
      minX,
      maxX,
    };
  };

  const getClampedX = () => {
    const { minX, maxX } = getTrackBounds();

    if (!maxX) {
      return 0;
    }
    const targetX = snapPointsRef.current[value];

    return gsap.utils.clamp(minX, maxX, targetX) - BUTTON_WIDTH / 2;
  };

  const renderAnimations = () => {
    const track = trackRef.current;
    if (!track) return;

    gsap.to(track, {
      x: getClampedX(),
      duration: 0.5,
      ease: 'power3.out',
    });
    gsap.to('button[data-selected="false"]', {
      width: BUTTON_WIDTH,
      duration: 0.5,
      ease: 'power3.out',
    });
    gsap.to('button[data-selected="true"]', {
      width: BUTTON_WIDTH * 2,
      duration: 0.5,
      ease: 'power3.out',
    });
  };

  useGSAP(() => {
    const track = trackRef.current;
    if (!track) return;

    snapPointsRef.current = calculateSnapPoints();

    gsap.set(track, { x: getClampedX() });
    gsap.set(buttonsRef.current[value], { width: BUTTON_WIDTH * 2 });
  }, { scope: containerRef });

  useGSAP(() => {
    renderAnimations();

    const track = trackRef.current;
    if (!track) return;
    Draggable.create(track, {
      type: 'x',
      bounds: getTrackBounds(),
      onDragStart() {
        const selectedBtn = buttonsRef.current[value];
        selectedBtn?.setAttribute('data-selected', String(false));
        selectedBtn?.setAttribute('data-active', String(true));
        gsap.to(selectedBtn, {
          duration: 0.2,
          width: BUTTON_WIDTH,
        });
      },
      onDrag() {
        // eslint-disable-next-line react/no-this-in-sfc
        const closestIndex = getClosestIndex(this.x);
        buttonsRef.current.forEach((btn, index) => {
          btn?.setAttribute('data-active', String(index === closestIndex));
        });
      },
      onRelease() {
        // eslint-disable-next-line react/no-this-in-sfc
        const closestIndex = getClosestIndex(this.x);
        const activeBtn = buttonsRef.current[closestIndex];
        activeBtn?.setAttribute('data-selected', String(true));
        buttonsRef.current.forEach((btn) => {
          btn?.setAttribute('data-active', String(false));
        });

        if (closestIndex === value) {
          renderAnimations();
        } else {
          setSelectedIndex(closestIndex);
        }
      },
    });
  }, { scope: containerRef, dependencies: [value] });

  const handleArrowClick = (direction: 'next' | 'prev') => {
    const targetMonth = gsap.utils.clamp(
      FIRST_MONTH_INDEX,
      LAST_MONTH_INDEX,
      direction === 'next' ? value + 1 : value - 1,
    );

    if (targetMonth === null) {
      return;
    }

    setSelectedIndex(targetMonth);
  };

  const setButtonRef = (el: HTMLButtonElement | null, index: number) => {
    buttonsRef.current[index] = el;
  };

  return (
    <div
      ref={containerRef}
      className="w-screen overflow-hidden relative touch-pan-y select-none left-1/2 -translate-x-1/2"
    >
      <div
        ref={trackRef}
        className="flex gap-4 py-17.5 items-center will-change-transform"
      >
        {MONTHS.map((month, index) => (
          <button
            key={month}
            ref={(el) => setButtonRef(el, index)}
            className={`
              shrink-0 py-2.5
              text-title-1 text-muted-foreground opacity-50
              data-selected:text-foreground data-active:text-foreground
              data-active:opacity-100 data-selected:opacity-100
              transition-colors duration-100
            `}
            style={{ width: BUTTON_WIDTH }}
            data-selected={index === value}
            data-component="month-btn"
            onClick={() => setSelectedIndex(index)}
          >
            <Typography.SpecialTitle2
              className={`
                pointer-events-none
                will-change-transform transition-transform
                duration-100 in-data-selected:scale-200 in-data-active:scale-150
              `}
            >
              {formatMonthIndex(month, i18n.resolvedLanguage ?? i18n.language)}
            </Typography.SpecialTitle2>
          </button>
        ))}
      </div>
      <div
        className={`
          flex justify-between items-center
          absolute 
          inset-0 w-82 z-10 
          left-1/2 -translate-x-1/2
        `}
      >
        <Button.Icon
          className="cursor-pointer hover:scale-150"
          onClick={() => handleArrowClick('prev')}
          variant="ghost"
          disabled={value === FIRST_MONTH_INDEX}
        >
          <LucideChevronLeft />
        </Button.Icon>
        <Button.Icon
          className="cursor-pointer hover:scale-150"
          onClick={() => handleArrowClick('next')}
          disabled={value === LAST_MONTH_INDEX}
        >
          <LucideChevronRight />
        </Button.Icon>
      </div>
    </div>
  );
};

export const MonthSwitcher = () => {
  const selectedMonth = useMonthStore((state) => state.selectedMonth);
  const setSelectedMonth = useMonthStore((state) => state.setSelectedMonth);

  return (
    <MonthSwitcherView value={selectedMonth} onChange={setSelectedMonth} />
  );
};
