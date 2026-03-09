import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ICaption1Props = Omit<ITypographyProps, 'variant'>;

export const Caption1: FC<ICaption1Props> = (props) => (
  <Typography variant="caption-1" {...props} />
);
