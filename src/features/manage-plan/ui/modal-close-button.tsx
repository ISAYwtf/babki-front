import { cn } from '@/shared/lib/shadcn-utils';
import { LucideX } from 'lucide-react';
import type { FC } from 'react';

interface ModalCloseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export const ModalCloseButton: FC<ModalCloseButtonProps> = ({ onClick, disabled, label }) => (
  <button
    type="button"
    className={cn(
      `
        inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground
        transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50
      `,
    )}
    onClick={onClick}
    aria-label={label}
    disabled={disabled}
  >
    <LucideX className="size-4" />
  </button>
);
