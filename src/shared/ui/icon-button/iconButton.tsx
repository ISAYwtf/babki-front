import type {
  ComponentProps,
  FC,
} from 'react';
import { Button } from '@/shared/ui/button';

type IIconButtonProps = ComponentProps<typeof Button>

export const IconButton: FC<IIconButtonProps> = (props) => (
  <Button
    variant="ghost"
    size="icon-sm"
    {...props}
  />
);
