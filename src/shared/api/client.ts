import { env } from '@/shared/lib/env';
import axios, { AxiosHeaders } from 'axios';
import { z } from 'zod';

const ACCESS_TOKEN_STORAGE_KEY = 'babki.accessToken';

const canUseLocalStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const getStoredAccessToken = () => {
  if (!canUseLocalStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const setAccessToken = (accessToken: string) => {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
};

export const clearAccessToken = () => {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const getAccessToken = () => {
  if (env.USE_LOCAL_AUTH_TOKEN) {
    return env.LOCAL_AUTH_TOKEN ?? null;
  }

  return getStoredAccessToken();
};

export const apiClient = axios.create({
  baseURL: env.BASE_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    const headers = new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);

    return {
      ...config,
      headers,
    };
  }

  return config;
});

export const parseWithSchema = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  payload: unknown,
): z.infer<TSchema> => schema.parse(payload);
