import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type IBody1Props = Omit<ITypographyProps, 'variant'>;

export const Body1: FC<IBody1Props> = (props) => (
  <Typography variant="body-1" {...props} />
);
