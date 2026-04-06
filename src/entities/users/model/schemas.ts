import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
  paginatedResponseSchema,
  paginationQuerySchema,
} from '@/shared/api';

export const userSchema = z
  .object({
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    email: z.email(),
    currency: z.string().length(3),
    birthDate: dateStringSchema.optional(),
    notes: z.string().max(2000).optional(),
  })
  .extend(entityMetaSchema.shape);

export const createUserSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  email: z.email(),
  currency: z.string().length(3),
  birthDate: dateStringSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(100).optional(),
});

export const usersPaginatedResponseSchema = paginatedResponseSchema(userSchema);

export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UsersPaginatedResponse = z.infer<typeof usersPaginatedResponseSchema>;
