import clsx from 'clsx';
import type {
  CSSProperties,
  FC,
  HTMLProps,
} from 'react';
import classes from './grid.module.css';

type AlignItemsType = CSSProperties['alignItems'];
type JustifyType = CSSProperties['justifyContent'];
type GapType = CSSProperties['gap'];
type ColumnsType = number;

interface IStackProps extends HTMLProps<HTMLDivElement> {
  alignItems?: AlignItemsType;
  justify?: JustifyType;
  gap?: GapType;
  cols?: ColumnsType;
}

export const Grid: FC<IStackProps> = ({
  alignItems,
  justify,
  gap,
  cols,
  className,
  ...htmlProps
}) => (
  <div
    {...htmlProps}
    className={clsx(
      classes.root,
      className,
    )}
    style={{
      ...htmlProps.style,
      alignItems,
      justifyContent: justify,
      gap,
      gridTemplateColumns: cols ? `repeat(${cols}, 1fr)` : undefined,
    }}
  />
);
