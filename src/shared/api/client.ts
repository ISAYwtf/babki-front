import axios from 'axios';
import { z } from 'zod';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const parseWithSchema = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  payload: unknown,
): z.infer<TSchema> => schema.parse(payload);
