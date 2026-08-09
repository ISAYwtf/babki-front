interface QueryErrorWithResponse {
  response?: {
    status?: number;
  };
}

export const shouldRetryCurrentUserQuery = (
  failureCount: number,
  error: unknown,
) => {
  const status = (error as QueryErrorWithResponse | null)?.response?.status;
  return status !== 401 && failureCount < 3;
};
