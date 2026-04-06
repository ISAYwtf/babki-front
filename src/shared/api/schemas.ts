import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const dateStringSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  {
    message: 'Invalid date string',
  },
);

export const entityMetaSchema = z.object({
  _id: objectIdSchema,
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
  __v: z.number().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100)
    .optional(),
});

export const paginatedResponseSchema = <TSchema extends z.ZodTypeAny>(
  itemSchema: TSchema,
) => z.object({
  items: z.array(itemSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});
