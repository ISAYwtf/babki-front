import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ISpecialBody2Props = Omit<ITypographyProps, 'variant'>;

export const SpecialBody2: FC<ISpecialBody2Props> = (props) => (
  <Typography variant="special-body-2" {...props} />
);
