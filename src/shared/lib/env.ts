import { z } from 'zod';

const envSchema = z.object({
  BASE_API_URL: z.url(),
  USE_LOCAL_AUTH_TOKEN: z
    .string()
    .optional()
    .default('false')
    .transform((value) => value === 'true'),
  LOCAL_AUTH_TOKEN: z.string().optional(),
}).refine(
  (value) => !value.USE_LOCAL_AUTH_TOKEN || !!value.LOCAL_AUTH_TOKEN,
  {
    message: 'FRONT_LOCAL_AUTH_TOKEN must be provided when FRONT_USE_LOCAL_AUTH_TOKEN is true',
    path: ['LOCAL_AUTH_TOKEN'],
  },
);

export const env = envSchema.parse({
  BASE_API_URL: import.meta.env.FRONT_BASE_API_URL,
  USE_LOCAL_AUTH_TOKEN: import.meta.env.FRONT_USE_LOCAL_AUTH_TOKEN,
  LOCAL_AUTH_TOKEN: import.meta.env.FRONT_LOCAL_AUTH_TOKEN,
});

export type Env = z.infer<typeof envSchema>;
