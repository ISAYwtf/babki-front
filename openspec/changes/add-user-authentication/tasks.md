## 1. Authentication contracts and session utilities

- [x] 1.1 Tighten login and registration form schemas so names are trimmed and required, request values match the agreed limits, and invalid authentication responses reject instead of silently succeeding.
- [x] 1.2 Add a reusable internal-redirect validator with focused coverage for valid paths, external URLs, protocol-relative URLs, empty values, and malformed values.
- [x] 1.3 Add injectable unauthorized-session handling to the shared API client, excluding login and registration responses and making concurrent `401` handling idempotent.
- [x] 1.4 Configure the current-user session query so authentication failures are not retried by the global query retry policy.

## 2. Route-level authentication flow

- [x] 2.1 Register the app-owned unauthorized callback so it clears the stored token and QueryClient cache and replaces navigation with a safe login redirect.
- [x] 2.2 Add a pathless protected route layout and move `/main` beneath it, preserving current-user preloading and allowing the router plugin to regenerate the route tree.
- [x] 2.3 Update `/` to choose between `/main` and `/login` from confirmed session state.
- [x] 2.4 Add `/login` and `/register` route modules, validate login search parameters, and redirect confirmed sessions away from both public auth routes.

## 3. Authentication pages and forms

- [x] 3.1 Add the responsive auth shell widget with the approved two-column brand-and-form layout and compact single-column mobile presentation.
- [x] 3.2 Add the login page and accessible TanStack Form for email/password submission, pending state, field validation, status-aware errors, registration navigation, and safe redirect restoration.
- [x] 3.3 Add the registration page and accessible TanStack Form for required first name, last name, email, password, and selectable currency initialized to `RUB`.
- [x] 3.4 Add localized Russian auth labels, validation messages, progress text, API error messages, navigation copy, and brand messaging.

## 4. Logout and authenticated navigation

- [x] 4.1 Extend the shared header with a generic actions slot without introducing a dependency on the auth feature.
- [x] 4.2 Add logout behavior that clears the stored token and entire QueryClient cache, replaces navigation with `/login`, and is hidden for environment-provided local token mode.
- [x] 4.3 Integrate the logout action into the main page header and confirm cached private content cannot render after browser back navigation.

## 5. Verification

- [x] 5.1 Add focused automated coverage for auth schema validation, redirect safety, session invalidation, auth-endpoint `401` exclusion, and logout cache isolation using the repository's existing lightweight test pattern.
- [x] 5.2 Run `npm run lint`, `npm run lint:architecture`, and `npm run build`, resolving all reported issues without editing `src/routeTree.gen.ts` manually.
- [x] 5.3 Manually verify login, registration, invalid credentials, duplicate email, missing and expired tokens, safe redirect restoration, logout, local-token mode, keyboard navigation, and wide/narrow responsive layouts.

## 6. Password visibility

- [x] 6.1 Add a red-to-green visibility-model test and localized Russian show-password and hide-password action labels.
- [x] 6.2 Add the feature-local password input with `Eye`/`EyeOff`, accessible toggle state, pending-state disabling, and integrate it into login and registration.
- [x] 6.3 Run the full test, lint, architecture, and build checks, then manually verify both forms, value preservation, and narrow-layout fit.
