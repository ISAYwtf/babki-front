import type { ElementProps, JSXTag } from '@/shared/types/jsx/elementProps';
import clsx from 'clsx';
import classes from './colorContainer.module.css';

export type ColorType = 'accent-red'
  | 'accent-green'
  | 'background-primary'
  | 'background-secondary'
  | 'label-primary'
  | 'label-secondary'
  | 'label-tertiary'
  | 'fill-primary'
  | 'fill-secondary'
  | 'fill-tertiary'
  | 'fill-quaternary'
  | 'fill-danger'
  | 'border-primary'
  | 'border-secondary';

export type IColorContainerProps<Tag extends JSXTag = 'div'> = ElementProps<Tag> & {
  color?: ColorType;
  as?: Tag;
};

export const ColorContainer = <Tag extends JSXTag = 'div'>(props: IColorContainerProps<Tag>) => {
  const {
    color,
    as = 'div',
    ...htmlProps
  } = props;
  const Element = as as 'div';
  const restProps = htmlProps as ElementProps;

  return (
    <Element
      {...restProps}
      className={clsx(color && classes[color], restProps.className)}
    />
  );
};
