import { ColorContainer, type IColorContainerProps } from '@/shared/ui/color-container/colorContainer';
import type { FC } from 'react';
import clsx from 'clsx';
import classes from './typography.module.css';

export type TypographyVariantType = 'special-title-1'
  | 'special-title-2'
  | 'special-body-1'
  | 'special-body-2'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'body-1'
  | 'body-2'
  | 'body-3'
  | 'caption-1'
  | 'caption-2';

export interface ITypographyProps extends IColorContainerProps<'p'> {
  variant: TypographyVariantType;
}

export const Typography: FC<ITypographyProps> = ({ variant, ...htmlProps }) => (
  <ColorContainer
    as="p"
    {...htmlProps}
    className={clsx(classes[variant], htmlProps.className)}
  />
);
