import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ITitle2Props = Omit<ITypographyProps, 'variant'>;

export const Title2: FC<ITitle2Props> = (props) => (
  <Typography variant="title-2" {...props} />
);
