import {
  createFileRoute,
  redirect,
  useSearch,
} from '@tanstack/react-router';
import { z } from 'zod';
import { usersQueryOptions } from '@/entities/users';
import { confirmSession } from '@/features/auth';
import { LoginPage } from '@/pages/login';
import { getAccessToken } from '@/shared/api';

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

function LoginRoute() {
  const { redirect: redirectTo } = useSearch({ from: '/login' });
  return <LoginPage redirect={redirectTo} />;
}

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ context }) => {
    const isAuthenticated = await confirmSession(
      getAccessToken(),
      () => context.queryClient.ensureQueryData(usersQueryOptions.me()),
    );

    if (isAuthenticated) {
      redirect({ to: '/main', throw: true });
    }
  },
  component: LoginRoute,
});
