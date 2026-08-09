import { z } from 'zod';

const emailSchema = z.string()
  .trim()
  .min(1, 'required')
  .pipe(z.email('email'));
const passwordSchema = z.string()
  .min(1, 'required')
  .min(8, 'passwordMin')
  .max(128, 'passwordMax');

export const authAccessTokenSchema = z.string()
  .refine((value) => value.trim().length > 0);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'required').max(100, 'nameMax'),
  lastName: z.string().trim().min(1, 'required').max(100, 'nameMax'),
  email: emailSchema,
  password: passwordSchema,
  currency: z.string().regex(/^[A-Z]{3}$/, 'currency'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;

export const defaultLoginFormValues: LoginDto = {
  email: '',
  password: '',
};

export const defaultRegisterFormValues: RegisterDto = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  currency: 'RUB',
};

interface AuthMutationError {
  response?: {
    status?: number;
  };
}

export const getAuthMutationErrorKey = (
  error: unknown,
  mode: 'login' | 'register',
) => {
  const status = (error as AuthMutationError | null)?.response?.status;

  if (mode === 'login' && status === 401) {
    return 'auth.login.errors.credentials';
  }

  if (mode === 'register' && status === 409) {
    return 'auth.register.errors.emailTaken';
  }

  return 'auth.errors.generic';
};

const authValidationKeys = {
  required: 'validation.required',
  email: 'auth.validation.email',
  passwordMin: 'auth.validation.passwordMin',
  passwordMax: 'auth.validation.passwordMax',
  nameMax: 'auth.validation.nameMax',
  currency: 'auth.validation.currency',
} as const;

export const getAuthValidationKey = (code: string | undefined) => (
  code && code in authValidationKeys
    ? authValidationKeys[code as keyof typeof authValidationKeys]
    : undefined
);
