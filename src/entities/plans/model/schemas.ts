import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  objectIdSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
} from '@/shared/api';

export const planStatusSchema = z.enum(['active', 'closed']);

export const planSchema = z
  .object({
    userId: objectIdSchema,
    description: z.string().max(500),
    targetDate: dateStringSchema,
    amount: z.number().min(0.01),
    categoryId: objectIdSchema,
    status: planStatusSchema,
    closedAt: dateStringSchema.optional(),
    expenseId: objectIdSchema.optional(),
    createdAt: dateStringSchema,
    updatedAt: dateStringSchema,
  })
  .extend(entityMetaSchema.shape);

export const listPlansQuerySchema = paginationQuerySchema.extend({
  status: planStatusSchema.optional(),
});

export const plansPaginatedResponseSchema = paginatedResponseSchema(planSchema);

export type PlanStatus = z.infer<typeof planStatusSchema>;
export type Plan = z.infer<typeof planSchema>;
export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;
export type PlansPaginatedResponse = z.infer<typeof plansPaginatedResponseSchema>;

export const createPlanPayloadSchema = z.object({
  description: z.string().max(500),
  targetDate: dateStringSchema,
  amount: z.number().min(0.01),
  categoryId: objectIdSchema,
});

export type CreatePlanPayload = z.infer<typeof createPlanPayloadSchema>;
