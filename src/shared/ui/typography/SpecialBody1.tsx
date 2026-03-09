import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ISpecialBody1Props = Omit<ITypographyProps, 'variant'>;

export const SpecialBody1: FC<ISpecialBody1Props> = (props) => (
  <Typography variant="special-body-1" {...props} />
);
