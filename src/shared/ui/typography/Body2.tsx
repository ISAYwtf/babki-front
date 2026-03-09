import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type IBody2Props = Omit<ITypographyProps, 'variant'>;

export const Body2: FC<IBody2Props> = (props) => (
  <Typography variant="body-2" {...props} />
);
