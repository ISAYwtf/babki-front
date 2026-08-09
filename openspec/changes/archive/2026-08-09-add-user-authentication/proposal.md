## Why

The application already exposes login and registration API clients, but it has no user-facing authentication pages or route protection. Users therefore cannot establish or end a session through the UI, and private finance data is not guarded from unauthenticated navigation.

## What Changes

- Add separate login and registration pages with responsive, localized forms.
- Protect finance routes with a route-level session guard backed by the current-user query.
- Persist successful sessions, return users to their originally requested internal route, and redirect authenticated users away from auth pages.
- Handle expired or rejected sessions centrally by clearing the token and user-scoped query data before redirecting to login.
- Add logout to the main page header and clear all cached user data when the session ends.
- Preserve the local development token workflow by bypassing auth pages and hiding logout when an environment-provided token is active.

## Capabilities

### New Capabilities

- `user-authentication`: Login, registration, protected-route access, session expiry, redirect restoration, and logout behavior.

### Modified Capabilities

None.

## Impact

- Adds auth route modules and page compositions under `src/app/routes/` and `src/pages/`.
- Extends `src/features/auth/` with form UI, validation, navigation coordination, and logout behavior.
- Adds a reusable auth page shell and extends the shared header with a generic actions slot while preserving Feature-Sliced dependency direction.
- Extends token and unauthorized-response handling around `src/shared/api/`, TanStack Query caching, and TanStack Router context.
- Adds Russian authentication copy and reuses the existing input, button, currency, user-query, and auth API infrastructure.
- Uses the existing `/auth/login`, `/auth/register`, and `/users/me` contracts; no backend API change or new runtime dependency is expected.
