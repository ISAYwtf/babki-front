import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { ComponentProps } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/shared/ui/input-otp';

interface TotpCodeInputProps extends Omit<
  ComponentProps<typeof InputOTP>,
  'children' | 'maxLength' | 'pattern' | 'render'
> {
  hasError?: boolean;
}

export function TotpCodeInput({
  containerClassName,
  hasError = false,
  ...props
}: TotpCodeInputProps) {
  const invalid = hasError || undefined;

  return (
    <InputOTP
      {...props}
      containerClassName={`w-full justify-center ${containerClassName ?? ''}`}
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-invalid={invalid}
    >
      <InputOTPGroup>
        {[0, 1, 2].map((index) => (
          <InputOTPSlot
            className="size-9 text-base sm:size-11"
            index={index}
            key={index}
            aria-invalid={invalid}
          />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {[3, 4, 5].map((index) => (
          <InputOTPSlot
            className="size-9 text-base sm:size-11"
            index={index}
            key={index}
            aria-invalid={invalid}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
