import { usersQueryOptions } from '@/entities/users';
import { MainPage } from '@/pages/main';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main')({
  loader: ({ context }) => (
    context.queryClient.ensureQueryData(usersQueryOptions.me())
  ),
  component: MainPage,
});
