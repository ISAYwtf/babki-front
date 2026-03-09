import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ITitle1Props = Omit<ITypographyProps, 'variant'>;

export const Title1: FC<ITitle1Props> = (props) => (
  <Typography variant="title-1" {...props} />
);
