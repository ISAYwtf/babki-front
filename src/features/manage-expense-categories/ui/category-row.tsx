import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import {
  LucideCheck,
  LucideLoaderCircle,
  LucideX,
} from 'lucide-react';
import {
  type FC,
  type FormEvent,
  useId,
} from 'react';
import { useTranslation } from 'react-i18next';
import type {
  CategoryDraft,
  CategoryDraftMutationError,
  CategoryDraftTouched,
} from '../model/category-draft';
import { isCategoryDraftDirty } from '../model/category-draft';
import { mapCategoryFieldError } from '../model/errors';
import type { CategoryDraftErrors } from '../model/validation';
import { ColorPicker } from './color-picker';

interface CategoryRowProps {
  draft: CategoryDraft;
  touched: CategoryDraftTouched;
  mutationError?: CategoryDraftMutationError;
  errors: CategoryDraftErrors;
  disabled: boolean;
  isSaving: boolean;
  onChange: (field: 'name' | 'color', value: string) => void;
  onBlur: (field: 'name' | 'color') => void;
  onDelete: () => void;
  onSave: () => void;
}

export const CategoryRow: FC<CategoryRowProps> = ({
  draft,
  touched,
  mutationError,
  errors,
  disabled,
  isSaving,
  onChange,
  onBlur,
  onDelete,
  onSave,
}) => {
  const { t } = useTranslation();
  const errorId = useId();
  const dirty = isCategoryDraftDirty(draft);
  const nameError = mutationError?.field === 'name'
    ? mutationError.message
    : touched.name
      ? mapCategoryFieldError(errors.name)
      : undefined;
  const colorError = touched.color
    ? mapCategoryFieldError(errors.color)
    : undefined;
  const genericMutationError = mutationError?.field
    ? undefined
    : mutationError?.message;
  const error = nameError ?? colorError ?? genericMutationError;
  const isValid = !errors.name && !errors.color;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || !dirty || !isValid) return;
    onSave();
  };

  return (
    <form
      className="grid grid-cols-[minmax(0,1fr)_38px_32px_32px] gap-x-2 gap-y-1"
      onSubmit={handleSubmit}
    >
      <Input.Base
        value={draft.values.name}
        onChange={(event) => onChange('name', event.target.value)}
        onBlur={() => onBlur('name')}
        placeholder={t('expenseCategories.management.fields.name')}
        aria-label={t('expenseCategories.management.fields.name')}
        aria-invalid={Boolean(nameError) || undefined}
        aria-describedby={nameError ? errorId : undefined}
        hasError={Boolean(nameError)}
        disabled={disabled}
        maxLength={101}
        className="h-[38px]"
      />

      <ColorPicker
        value={draft.values.color}
        onValueChange={(value) => onChange('color', value)}
        onBlur={() => onBlur('color')}
        disabled={disabled}
        hasError={Boolean(colorError)}
        label={t('expenseCategories.management.fields.color')}
        describedBy={colorError && error === colorError ? errorId : undefined}
      />

      <Button.Icon
        type="button"
        variant="ghost"
        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label={t('expenseCategories.management.actions.delete')}
        onClick={onDelete}
        disabled={disabled}
      >
        <LucideX />
      </Button.Icon>

      <div className="flex size-8 items-center justify-center">
        {dirty && (
          <Button.Icon
            type="submit"
            variant="ghost"
            className="size-8 text-success hover:bg-success/10 hover:text-success"
            aria-label={isSaving
              ? t('expenseCategories.management.actions.saving')
              : t('expenseCategories.management.actions.save')}
            aria-busy={isSaving || undefined}
            disabled={disabled || !isValid}
          >
            {isSaving
              ? <LucideLoaderCircle className="animate-spin motion-reduce:animate-none" />
              : <LucideCheck />}
          </Button.Icon>
        )}
      </div>

      {error && (
        <Typography.Caption1
          id={errorId}
          className="col-span-4 text-destructive"
          role="alert"
        >
          {error}
        </Typography.Caption1>
      )}
    </form>
  );
};
