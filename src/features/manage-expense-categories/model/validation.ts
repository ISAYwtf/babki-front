import { z } from 'zod';
import { normalizeCategoryName } from './category-draft';
import { isCategoryColor } from './constants';

export type CategoryDraftFieldError = 'required' | 'tooLong' | 'duplicate' | 'invalidColor';

export interface CategoryDraftErrors {
  name?: CategoryDraftFieldError;
  color?: CategoryDraftFieldError;
}

export const categoryDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'required')
    .max(100, 'tooLong'),
  color: z
    .string()
    .min(1, 'required')
    .refine(isCategoryColor, 'invalidColor'),
});

export const categoryFormSchema = z.object({
  drafts: z.array(z.object({
    key: z.string(),
    categoryId: z.string().optional(),
    baseline: z.object({
      name: z.string(),
      color: z.string(),
    }).nullable(),
    values: categoryDraftSchema,
  })).superRefine((drafts, context) => {
    drafts.forEach((draft, index) => {
      if (!categoryDraftSchema.shape.name.safeParse(draft.values.name).success) return;

      const normalizedName = normalizeCategoryName(draft.values.name);
      const duplicate = drafts.some((other, otherIndex) => (
        otherIndex !== index
        && normalizeCategoryName(other.values.name) === normalizedName
      ));

      if (duplicate) {
        context.addIssue({
          code: 'custom',
          message: 'duplicate',
          path: [index, 'values', 'name'],
        });
      }
    });
  }),
});
