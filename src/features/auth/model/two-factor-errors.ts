type TwoFactorErrorScope = 'login' | 'management' | 'setup' | 'lifecycle';

interface MutationError {
  response?: {
    status?: number;
    headers?: {
      get?: (name: string) => unknown;
      [key: string]: unknown;
    };
  };
}

export const isTwoFactorStatusConflict = (error: unknown) => (
  (error as MutationError | null)?.response?.status === 409
);

export const getTwoFactorErrorKey = (
  error: unknown,
  scope: TwoFactorErrorScope,
) => {
  const status = (error as MutationError | null)?.response?.status;

  if (status === 429) {
    return 'auth.twoFactor.errors.rateLimited';
  }
  if (scope === 'login' && status === 401) {
    return 'auth.twoFactor.login.errors.invalid';
  }
  if (scope === 'setup' && status === 409) {
    return 'auth.twoFactor.setup.errors.enabled';
  }
  if (scope === 'setup' && status === 503) {
    return 'auth.twoFactor.setup.errors.unavailable';
  }
  if (scope === 'lifecycle' && status === 409) {
    return 'auth.twoFactor.management.errors.stateChanged';
  }
  if (scope === 'lifecycle' && status === 503) {
    return 'auth.twoFactor.management.errors.unavailable';
  }
  if (scope !== 'login' && status === 401) {
    return 'auth.twoFactor.management.errors.credentials';
  }

  return 'auth.errors.generic';
};

export const getRetryAfterSeconds = (error: unknown) => {
  const headers = (error as MutationError | null)?.response?.headers;
  const rawValue = headers?.get?.('retry-after') ?? headers?.['retry-after'];
  const seconds = typeof rawValue === 'number'
    ? rawValue
    : Number.parseInt(String(rawValue ?? ''), 10);

  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
};
