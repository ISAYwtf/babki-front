import clsx from 'clsx';
import type {
  CSSProperties,
  FC,
  HTMLProps,
} from 'react';
import classes from './stack.module.css';

type DirectionType = CSSProperties['flexDirection'];
type AlignItemsType = CSSProperties['alignItems'];
type JustifyType = CSSProperties['justifyContent'];
type GapType = CSSProperties['gap'];

interface IStackProps extends HTMLProps<HTMLDivElement> {
  direction?: DirectionType;
  alignItems?: AlignItemsType;
  justify?: JustifyType;
  gap?: GapType;
}

export const Stack: FC<IStackProps> = ({
  direction = 'column',
  alignItems,
  justify,
  gap,
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
      flexDirection: direction,
      alignItems,
      justifyContent: justify,
      gap,
    }}
  />
);
