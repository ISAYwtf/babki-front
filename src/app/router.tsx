import { RouterProvider, createRouter } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { endSession } from '@/features/auth';
import {
  clearAccessToken,
  setUnauthorizedSessionHandler,
} from '@/shared/api';
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

setUnauthorizedSessionHandler(() => {
  const { location } = router.state;
  const { pathname } = location;
  const redirect = pathname === '/login' || pathname === '/register'
    ? null
    : location.href;

  endSession({
    clearToken: clearAccessToken,
    clearCache: () => queryClient.clear(),
    navigateToLogin: (safeRedirect) => {
      router.navigate({
        to: '/login',
        search: safeRedirect ? { redirect: safeRedirect } : {},
        replace: true,
      }).catch(() => undefined);
    },
  }, redirect);
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
