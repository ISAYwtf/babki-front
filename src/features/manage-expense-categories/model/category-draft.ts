import type { ExpenseCategory } from '@/entities/expense-categories';
import { NEW_CATEGORY_ROW_KEY } from './constants';

export interface CategoryDraftValues {
  name: string;
  color: string;
}

export interface CategoryDraftTouched {
  name: boolean;
  color: boolean;
}

export interface CategoryDraftMutationError {
  field?: 'name';
  message: string;
}

export interface CategoryDraft {
  key: string;
  categoryId?: string;
  baseline: CategoryDraftValues | null;
  values: CategoryDraftValues;
}

export interface CategoryFormValues {
  drafts: CategoryDraft[];
}

export const emptyCategoryFormValues: CategoryFormValues = {
  drafts: [],
};

export const normalizeCategoryName = (name: string) => name.trim().toLowerCase();

export const createCategoryDraft = (category: ExpenseCategory): CategoryDraft => {
  const values = {
    name: category.name,
    color: category.color ?? '',
  };

  return {
    key: category._id,
    categoryId: category._id,
    baseline: values,
    values,
  };
};

export const createCategoryDrafts = (categories: ExpenseCategory[]) => (
  [...categories]
    .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt))
    .map(createCategoryDraft)
);

export const createEmptyCategoryDraft = (): CategoryDraft => ({
  key: NEW_CATEGORY_ROW_KEY,
  baseline: null,
  values: {
    name: '',
    color: '',
  },
});

export const isCategoryDraftDirty = (draft: CategoryDraft) => {
  if (!draft.baseline) {
    return true;
  }

  return draft.values.name.trim() !== draft.baseline.name.trim()
    || draft.values.color !== draft.baseline.color;
};
