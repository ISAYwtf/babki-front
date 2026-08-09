import {
  Outlet,
  createFileRoute,
  redirect,
} from '@tanstack/react-router';
import { usersQueryOptions } from '@/entities/users';
import { confirmSession } from '@/features/auth';
import { getAccessToken } from '@/shared/api';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const isAuthenticated = await confirmSession(
      getAccessToken(),
      () => context.queryClient.ensureQueryData(usersQueryOptions.me()),
    );

    if (!isAuthenticated) {
      redirect({
        to: '/login',
        search: { redirect: location.href },
        replace: true,
        throw: true,
      });
    }
  },
  component: Outlet,
});
