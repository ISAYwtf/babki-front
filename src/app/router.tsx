import { RouterProvider, createRouter } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/query-client';
import { routeTree } from '@/routeTree.gen';

export interface AppRouterContext {
  queryClient: QueryClient;
}

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
