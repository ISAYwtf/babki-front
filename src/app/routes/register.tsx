import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router';
import { usersQueryOptions } from '@/entities/users';
import { confirmSession } from '@/features/auth';
import { RegisterPage } from '@/pages/register';
import { getAccessToken } from '@/shared/api';

export const Route = createFileRoute('/register')({
  beforeLoad: async ({ context }) => {
    const isAuthenticated = await confirmSession(
      getAccessToken(),
      () => context.queryClient.ensureQueryData(usersQueryOptions.me()),
    );

    if (isAuthenticated) {
      redirect({ to: '/main', throw: true });
    }
  },
  component: RegisterPage,
});
