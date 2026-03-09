import type { FC } from 'react';
import { type ITypographyProps, Typography } from './typography';

export type ITitle3Props = Omit<ITypographyProps, 'variant'>;

export const Title3: FC<ITitle3Props> = (props) => (
  <Typography variant="title-3" {...props} />
);
