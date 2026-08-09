import { z } from 'zod';
import { userSchema } from '@/entities/users';
import { authAccessTokenSchema } from './auth-form';

export {
  authAccessTokenSchema,
  defaultLoginFormValues,
  defaultRegisterFormValues,
  getAuthMutationErrorKey,
  getAuthValidationKey,
  loginSchema,
  registerSchema,
} from './auth-form';
export type {
  LoginDto,
  RegisterDto,
} from './auth-form';

export const authResponseSchema = z.object({
  accessToken: authAccessTokenSchema,
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
