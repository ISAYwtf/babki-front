import { cn } from '@/shared/lib/shadcn-utils';
import { LucideX } from 'lucide-react';
import type { FC } from 'react';

interface ModalCloseButtonProps {
  onClick: () => void;
  label: string;
}

export const ModalCloseButton: FC<ModalCloseButtonProps> = ({ onClick, label }) => (
  <button
    type="button"
    className={cn(
      `
        inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground
        transition-colors hover:bg-muted hover:text-foreground
      `,
    )}
    onClick={onClick}
    aria-label={label}
  >
    <LucideX className="size-4" />
  </button>
);
