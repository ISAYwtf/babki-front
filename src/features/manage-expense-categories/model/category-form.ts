import { getFirstFieldError } from '@/shared/lib/form-errors';
import { useForm } from '@tanstack/react-form';
import { emptyCategoryFormValues } from './category-draft';
import type {
  CategoryDraftErrors,
  CategoryDraftFieldError,
} from './validation';
import { categoryFormSchema } from './validation';

export const useCategoryForm = () => useForm({
  defaultValues: emptyCategoryFormValues,
  validators: {
    onChange: categoryFormSchema,
  },
});

export type CategoryFormApi = ReturnType<typeof useCategoryForm>;

export const getCategoryDraftErrors = (
  form: CategoryFormApi,
  index: number,
): CategoryDraftErrors => {
  const getFieldError = (
    field: `drafts[${number}].values.${'name' | 'color'}`,
  ) => getFirstFieldError(form.getFieldMeta(field)?.errors ?? []) as
    CategoryDraftFieldError | undefined;

  return {
    name: getFieldError(`drafts[${index}].values.name`),
    color: getFieldError(`drafts[${index}].values.color`),
  };
};
