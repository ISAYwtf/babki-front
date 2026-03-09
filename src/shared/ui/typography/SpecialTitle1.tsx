import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ISpecialTitle1Props = Omit<ITypographyProps, 'variant'>;

export const SpecialTitle1: FC<ISpecialTitle1Props> = (props) => (
  <Typography variant="special-title-1" {...props} />
);
