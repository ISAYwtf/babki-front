import { getFirstFieldError } from '@/shared/lib/form-errors';
import type { FC } from 'react';
import type { CategoryFormApi } from '../model/category-form';
import type {
  CategoryDraft,
  CategoryDraftMutationError,
} from '../model/category-draft';
import type {
  CategoryDraftErrors,
  CategoryDraftFieldError,
} from '../model/validation';
import { CategoryRow } from './category-row';

interface CategoryFormRowProps {
  form: CategoryFormApi;
  draft: CategoryDraft;
  index: number;
  mutationError?: CategoryDraftMutationError;
  disabled: boolean;
  isSaving: boolean;
  onMutationErrorClear: (key: string, field: 'name' | 'color') => void;
  onDelete: () => void;
  onSave: () => void;
}

export const CategoryFormRow: FC<CategoryFormRowProps> = ({
  form,
  draft,
  index,
  mutationError,
  disabled,
  isSaving,
  onMutationErrorClear,
  onDelete,
  onSave,
}) => (
  <form.Field
    name={`drafts[${index}].values.name`}
  >
    {(nameField) => (
      <form.Field name={`drafts[${index}].values.color`}>
        {(colorField) => {
          const errors: CategoryDraftErrors = {
            name: getFirstFieldError(nameField.state.meta.errors) as
              CategoryDraftFieldError | undefined,
            color: getFirstFieldError(colorField.state.meta.errors) as
              CategoryDraftFieldError | undefined,
          };

          return (
            <CategoryRow
              draft={draft}
              touched={{
                name: nameField.state.meta.isTouched,
                color: colorField.state.meta.isTouched,
              }}
              mutationError={mutationError}
              errors={errors}
              disabled={disabled}
              isSaving={isSaving}
              onChange={(field, value) => {
                onMutationErrorClear(draft.key, field);
                if (field === 'name') {
                  nameField.handleChange(value);
                } else {
                  colorField.handleChange(value);
                }
              }}
              onBlur={(field) => {
                if (field === 'name') {
                  nameField.handleBlur();
                } else {
                  colorField.handleBlur();
                }
              }}
              onDelete={onDelete}
              onSave={onSave}
            />
          );
        }}
      </form.Field>
    )}
  </form.Field>
);
