import { Select as SelectPrimitive } from '@base-ui/react';
import { cn } from '@/shared/lib/shadcn-utils';
import { LucideChevronDown } from 'lucide-react';
import type { FC } from 'react';
import { ExpenseCategoryBadge } from './expense-category';

export interface CategorySelectOption {
  _id: string;
  name: string;
  color?: string;
}

interface CategorySelectProps {
  options: CategorySelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
}

export const CategorySelect: FC<CategorySelectProps> = ({
  options,
  value,
  onValueChange,
  onBlur,
  placeholder,
  disabled,
  hasError,
  describedBy,
}) => {
  const selected = options.find((option) => option._id === value);

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next ?? '')}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        onBlur={onBlur}
        className={cn(
          `
            flex h-11 min-w-0 w-full items-center justify-between overflow-hidden rounded-lg border bg-background
            px-3 py-2 text-body-2 transition-colors outline-none
            focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30
            disabled:cursor-not-allowed disabled:opacity-50
          `,
          hasError && [
            'border-destructive',
            'focus-visible:border-destructive focus-visible:ring-destructive/20',
          ],
        )}
        aria-label={placeholder}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
      >
        {selected ? (
          <ExpenseCategoryBadge color={selected.color}>{selected.name}</ExpenseCategoryBadge>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <LucideChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner className="z-50">
          <SelectPrimitive.Popup
            className="
              z-50 max-h-60 min-w-(--anchor-width) overflow-y-auto rounded-lg border
              bg-popover p-1 shadow-md outline-none
            "
          >
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option._id}
                value={option._id}
                className="
                  flex cursor-default items-center rounded-md px-2 py-1.5 outline-none
                  hover:bg-muted data-highlighted:bg-muted
                "
              >
                <SelectPrimitive.ItemText>
                  <ExpenseCategoryBadge color={option.color}>{option.name}</ExpenseCategoryBadge>
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
