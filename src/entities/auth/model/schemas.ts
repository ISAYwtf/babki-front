import { z } from 'zod';
import { dateStringSchema } from '@/shared/api';
import { userSchema } from '@/entities/users/model/schemas';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
  currency: z.string().length(3),
  birthDate: dateStringSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
