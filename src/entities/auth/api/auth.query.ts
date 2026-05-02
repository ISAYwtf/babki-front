import {
  mutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { setAccessToken } from '@/shared/api';
import { usersQueryKeys } from '@/entities/users';
import { authApi } from './auth.api';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
} from '../model/schemas';

const handleAuthSuccess = (authResponse: AuthResponse) => {
  setAccessToken(authResponse.accessToken);
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    mutationOptions({
      mutationFn: (payload: LoginDto) => authApi.login(payload),
      onSuccess: (authResponse) => {
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
        handleAuthSuccess(authResponse);
        queryClient.setQueryData(usersQueryKeys.me(), authResponse.user);
      },
    }),
  );
};
