## Context

The frontend already has typed login and registration API calls, mutations that persist an access token and seed the current-user query, `/users/me` query options, and a request interceptor that attaches either a stored token or the development token from environment variables. The current router redirects `/` directly to `/main`, and `/main` loads the current user without a dedicated protected-route boundary or recovery behavior for missing and expired sessions.

The change crosses routing, TanStack Query caching, Axios response handling, Feature-Sliced UI layers, and the shared page header. It must preserve the dependency direction `app -> pages -> widgets -> features -> entities -> shared`, avoid editing the generated route tree, keep the environment-provided local token workflow, and add no backend or runtime dependency.

## Goals / Non-Goals

**Goals:**

- Provide separate, localized login and registration experiences using the existing API contracts.
- Establish one route-level boundary for private finance pages.
- Restore a requested internal URL after successful login.
- End rejected or explicit sessions without retaining user-specific cached data.
- Add responsive, keyboard-accessible auth UI using existing design primitives.
- Keep local development authentication usable without exposing a non-functional logout action.

**Non-Goals:**

- Password recovery, email verification, social login, multi-factor authentication, or role-based authorization.
- Refresh tokens, cookie-based sessions, or changes to backend authentication endpoints.
- Registration fields beyond first name, last name, email, password, and currency.
- A persistent "remember me" preference or a password-confirmation field.
- Unrelated dashboard or shared-component redesigns.

## Decisions

### Use a route-first session boundary

A pathless protected layout SHALL own the session check for `/main` and future private routes. It reads the token synchronously and confirms a token-backed session through `usersQueryOptions.me()` before rendering private content. Public `/login` and `/register` routes redirect a confirmed authenticated session to `/main`, while `/` selects `/main` or `/login` through the same session rules.

This keeps authorization at navigation boundaries and uses the router/query integration already present. A global React `AuthProvider` was rejected because it would duplicate current-user state from TanStack Query and add a second loading lifecycle. Per-page checks were rejected because they duplicate security-sensitive logic and make new routes easy to leave unprotected.

### Treat the token plus `/users/me` as session authority

Token presence is only a fast precondition; `/users/me` confirms that the token is accepted and supplies the current user. Successful login and registration persist the access token and seed the same current-user query key before navigation. A missing token redirects immediately without issuing a private request. Authentication failures from the current-user check are not retried with the global three-retry default.

The existing local-storage token mechanism remains unchanged because the backend does not provide a cookie or refresh-token contract. An invalid or schema-incompatible auth response SHALL be treated as a failed mutation instead of silently completing with `null`.

### Inject unauthorized navigation from the app layer

The shared Axios client SHALL expose a way for the app layer to register an unauthorized-session callback. The response interceptor invokes it only for a `401` from a request that represents an authenticated resource and excludes `/auth/login` and `/auth/register`. The app-owned callback clears the stored token, clears the entire QueryClient cache, and navigates to login with the current internal location as the redirect target.

Injecting the callback preserves Feature-Sliced dependency direction: `shared/api` does not import the router or auth feature. Direct navigation from the shared client and browser custom events were rejected because they couple transport code to application routing or create an implicit event contract. The handler must be idempotent so concurrent rejected requests do not cause redirect storms.

### Validate restored destinations

The redirect query value SHALL be accepted only when it resolves to an internal application path beginning with a single `/` and not `//`. Successful login uses a valid redirect target and otherwise falls back to `/main`. Registration always proceeds to `/main` because it begins a new user journey rather than resuming access to an existing private location.

### Keep auth composition aligned with Feature-Sliced Design

- Route modules under `src/app/routes/` perform route orchestration only.
- `src/pages/login/` and `src/pages/register/` compose page content.
- A widget-level auth shell owns the responsive two-column presentation and accepts form content.
- `src/features/auth/` owns login, registration, form validation, error mapping, and logout UI/behavior.
- The shared header gains only a generic action slot; `MainPage` supplies the feature-level logout action.

On wide screens, the auth shell shows brand/product messaging beside the form. On narrow screens, the brand area becomes a compact header above the form. Login contains email and password. Registration contains required trimmed first and last names, email, password, and a selectable three-letter currency initialized to `RUB`. The existing optional API fields are omitted.

### Use status-aware, accessible form feedback

Forms use TanStack Form, Zod, existing inputs/buttons, and localized copy. Field constraints are reported next to labeled controls. While a mutation is pending, controls are disabled and the submit label describes progress. Login `401` remains a local invalid-credentials error; registration `409` reports an existing email; network, server, and invalid-response failures use a retryable generic message. Form-level errors use an announced alert region without erasing entered values.

### Keep password visibility inside the auth feature

A feature-local password input component SHALL provide the visibility toggle used by both authentication forms. It composes the existing shared input and icon-button primitives, keeps visibility state internally, and selects the input type, `Eye` or `EyeOff` icon, localized action label, and `aria-pressed` value from that state.

The component preserves the form-owned id, name, value, validation attributes, and login or registration autocomplete value. The input has enough right padding to prevent text from overlapping the icon, and the toggle is positioned inside the field, participates in keyboard navigation with visible focus, uses `type="button"`, and is disabled with the other controls while authentication is pending. A newly mounted form starts with the password masked.

Duplicating visibility state and markup in both forms was rejected because the behavior and accessibility contract could diverge. Adding a generic end-adornment API to the shared input was rejected because no other current consumer needs that broader abstraction.

### Clear all query data when identity changes

Logout and rejected authenticated sessions clear the entire QueryClient cache, not only the current-user entry, because finance queries contain identity-specific data. After logout, navigation uses replacement semantics to prevent the browser back button from revealing a rendered private page from history.

When `FRONT_USE_LOCAL_AUTH_TOKEN=true`, route checks use the environment token, auth pages are bypassed, and logout is hidden because clearing local storage cannot end an environment-provided session.

## Risks / Trade-offs

- **Access tokens remain in local storage and are exposed to successful XSS** → Preserve the current backend contract, avoid rendering untrusted markup, and treat a future cookie/refresh-token migration as a separate security change.
- **Concurrent private requests can all return `401`** → Make session invalidation and redirect handling idempotent and ignore further unauthorized callbacks after navigation begins.
- **A stale current-user query could outlive a user switch** → Clear the full QueryClient cache on logout and rejected sessions, then seed only the new current user after authentication.
- **Default query retries can delay an expired-session redirect** → Disable retries for authentication failures on the current-user session check.
- **A crafted redirect parameter could become an open redirect** → Accept only normalized internal application paths and fall back to `/main`.
- **Backend error bodies have no documented frontend schema** → Use stable HTTP status mappings with a generic fallback rather than depending on optional response text.
- **The split layout has less room on small screens** → Collapse to a single-column form with a compact brand header and verify at narrow viewport widths.

## Migration Plan

1. Add session utilities, unauthorized callback registration, and query-cache invalidation behavior without changing existing endpoint contracts.
2. Add the protected route layout, public auth routes, and root redirect logic; allow the router plugin to regenerate `src/routeTree.gen.ts`.
3. Add auth shell, forms, translations, and logout integration.
4. Validate production-token, missing-token, invalid-token, and local-token flows before release.
5. Add and verify the feature-local password visibility toggle on both authentication forms.

Rollback consists of reverting the route boundary and auth UI while leaving the existing API clients and token helpers intact. No persisted data migration is required.

## Open Questions

None. Password recovery, extended profile onboarding, and stronger token storage are intentionally deferred to separate changes.
