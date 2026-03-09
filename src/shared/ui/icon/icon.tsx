import { ColorContainer } from '@/shared/ui/color-container';
import type { IColorContainerProps } from '@/shared/ui/color-container/colorContainer';
import {
  type FC,
  type HTMLProps,
} from 'react';
import * as icons from '@/shared/assets/icons';

interface IIconProps extends IColorContainerProps<'span'> {
  icon: keyof typeof icons;
  SvgProps?: HTMLProps<SVGSVGElement>;
}

export const Icon: FC<IIconProps> = ({ icon, SvgProps, ...htmlProps }) => {
  const MyIcon = icons[icon];

  return (
    <ColorContainer as="span" {...htmlProps}>
      <MyIcon {...SvgProps} />
    </ColorContainer>
  );
};
