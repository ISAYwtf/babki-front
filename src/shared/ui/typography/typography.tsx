import type { ElementProps } from '@/shared/types/jsx/elementProps';
import { cva } from 'class-variance-authority';
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

const typographyVariantsToClasses: Record<TypographyVariantType, string> = {
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

const typographyVariants = cva('', {
  variants: {
    variant: typographyVariantsToClasses,
  },
  defaultVariants: {
    variant: 'body-1',
  },
});

export const TypographyBase: FC<ITypographyProps> = ({ variant, className, ...htmlProps }) => (
  <p
    {...htmlProps}
    className={clsx(typographyVariants({ variant }), className)}
  />
);

export type ITypographyVariantProps = Omit<ITypographyProps, 'variant'>;

export const Body1: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="body-1" {...props} />
);

export const Body2: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="body-2" {...props} />
);

export const Body3: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="body-3" {...props} />
);

export const Caption1: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="caption-1" {...props} />
);

export const Caption2: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="caption-2" {...props} />
);

export const SpecialBody1: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="special-body-1" {...props} />
);

export const SpecialBody2: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="special-body-2" {...props} />
);

export const SpecialTitle1: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="special-title-1" {...props} />
);

export const SpecialTitle2: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="special-title-2" {...props} />
);

export const Title1: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="title-1" {...props} />
);

export const Title2: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="title-2" {...props} />
);

export const Title3: FC<ITypographyVariantProps> = (props) => (
  <TypographyBase variant="title-3" {...props} />
);
