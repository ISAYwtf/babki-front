import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type IBody3Props = Omit<ITypographyProps, 'variant'>;

export const Body3: FC<IBody3Props> = (props) => (
  <Typography variant="body-3" {...props} />
);
