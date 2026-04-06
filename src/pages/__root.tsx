import {
  ErrorComponent,
  Outlet,
  createRootRouteWithContext,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { AppRouterContext } from '@/app/router';

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </>
  );
}

function RootErrorBoundary({ error }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-xl flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Navigation error
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Something went wrong while loading this page.
        </h1>
        <div className="text-sm text-muted-foreground">
          <ErrorComponent error={error} />
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: RootComponent,
  errorComponent: RootErrorBoundary,
});
