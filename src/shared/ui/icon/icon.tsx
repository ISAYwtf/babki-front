import type { ElementProps } from '@/shared/types/jsx/elementProps';
import clsx from 'clsx';
import {
  type FC,
  type HTMLProps,
} from 'react';
import * as icons from '@/shared/assets/icons';

export interface IIconProps extends ElementProps<'span'> {
  icon: keyof typeof icons;
  SvgProps?: HTMLProps<SVGSVGElement>;
}

export const Icon: FC<IIconProps> = ({ icon, SvgProps, ...htmlProps }) => {
  const MyIcon = icons[icon];

  return (
    <span
      {...htmlProps}
      className={clsx('h-fit', htmlProps.className)}
    >
      <MyIcon {...SvgProps} />
    </span>
  );
};
