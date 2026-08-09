import {
  mutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  resetUnauthorizedSessionHandling,
  setAccessToken,
} from '@/shared/api';
import { usersQueryKeys } from '@/entities/users';
import { authApi } from './auth.api';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
} from '../model/schemas';

function handleAuthSuccess(authResponse: AuthResponse) {
  setAccessToken(authResponse.accessToken);
  resetUnauthorizedSessionHandling();
}

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: (payload: LoginDto) => authApi.login(payload),
      onSuccess: (authResponse) => {
        if (!authResponse) return;

        handleAuthSuccess(authResponse);
        queryClient.setQueryData(usersQueryKeys.me(), authResponse.user);
      },
    }),
  );
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: (payload: RegisterDto) => authApi.register(payload),
      onSuccess: (authResponse) => {
        if (!authResponse) return;

        handleAuthSuccess(authResponse);
        queryClient.setQueryData(usersQueryKeys.me(), authResponse.user);
      },
    }),
  );
};
