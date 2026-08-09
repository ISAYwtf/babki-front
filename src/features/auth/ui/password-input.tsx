import { LucideEye, LucideEyeOff } from 'lucide-react';
import {
  type ComponentProps,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/shadcn-utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { getPasswordVisibilityState } from '../model/password-visibility';

type PasswordInputProps = Omit<ComponentProps<typeof Input.Base>, 'type'>;

export function PasswordInput({ className, disabled, ...inputProps }: PasswordInputProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const visibility = getPasswordVisibilityState(isVisible);
  const VisibilityIcon = isVisible ? LucideEyeOff : LucideEye;

  return (
    <div className="relative">
      <Input.Base
        {...inputProps}
        className={cn('pr-11', className)}
        disabled={disabled}
        type={visibility.type}
      />
      <Button.Icon
        className="absolute top-1/2 right-2 -translate-y-1/2 active:"
        type="button"
        aria-label={t(visibility.labelKey)}
        aria-pressed={isVisible}
        disabled={disabled}
        onClick={() => setIsVisible((current) => !current)}
        disableHoverTranslation
      >
        <VisibilityIcon aria-hidden="true" />
      </Button.Icon>
    </div>
  );
}
