import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ISpecialTitle2Props = Omit<ITypographyProps, 'variant'>;

export const SpecialTitle2: FC<ISpecialTitle2Props> = (props) => (
  <Typography variant="special-title-2" {...props} />
);
