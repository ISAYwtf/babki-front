import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ICaption2Props = Omit<ITypographyProps, 'variant'>;

export const Caption2: FC<ICaption2Props> = (props) => (
  <Typography variant="caption-2" {...props} />
);
