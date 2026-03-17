import type { ElementProps } from '@/shared/types/jsx/elementProps';
import { clsx } from 'clsx';
import type { FC } from 'react';

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

export interface ITypographyProps extends ElementProps<'p'> {
  variant: TypographyVariantType;
}

const variantToClassName: Record<TypographyVariantType, string> = {
  'special-title-1': 'text-special-title-1',
  'special-title-2': 'text-special-title-2',
  'special-body-1': 'text-special-body-1',
  'special-body-2': 'text-special-body-2',
  'title-1': 'text-title-1',
  'title-2': 'text-title-2',
  'title-3': 'text-title-3',
  'body-1': 'text-body-1',
  'body-2': 'text-body-2',
  'body-3': 'text-body-3',
  'caption-1': 'text-caption-1',
  'caption-2': 'text-caption-2',
};

export const Typography: FC<ITypographyProps> = ({ variant, ...htmlProps }) => (
  <p
    {...htmlProps}
    className={clsx(variantToClassName[variant], htmlProps.className)}
  />
);
