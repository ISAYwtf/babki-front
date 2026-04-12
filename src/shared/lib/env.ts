import { z } from 'zod';

const envSchema = z.object({
  USER_ID: z.string(),
  BASE_API_URL: z.url(),
});

export const env = envSchema.parse({
  USER_ID: import.meta.env.FRONT_USER_ID,
  BASE_API_URL: import.meta.env.FRONT_BASE_API_URL,
});

export type Env = z.infer<typeof envSchema>;
