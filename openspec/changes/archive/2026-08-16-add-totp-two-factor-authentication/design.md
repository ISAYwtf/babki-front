## Context

See `proposal.md` for motivation. The frontend currently models `/auth/login` as returning only `{ accessToken, user }`, establishes the session inside the login mutation, and renders a single password form. Authentication API code, schemas, mutations, and forms live in `src/features/auth`; the authenticated main page exposes only logout through the generic header action slot.

The backend now returns either the existing authenticated-session shape or an opaque five-minute challenge from password login. It also exposes authenticated status, setup, confirmation, disable, and recovery-regeneration endpoints. Setup returns an `otpauthUri` and Base32 secret but intentionally no QR image. Confirmation, disabling, and regeneration increment the backend authentication version, invalidate the request token, and return a replacement token. Recovery plaintext is returned only when generated.

The design must preserve Feature-Sliced import direction, the existing safe redirect behavior, full query-cache isolation between identities, local environment-token development, responsive accessibility, and the rule that authentication material is never logged or sent to third parties.

## Goals / Non-Goals

**Goals:**

- Model every new backend request and response with strict frontend schemas.
- Keep password login, challenge completion, and factor management as explicit state transitions with one shared session-establishment path.
- Keep challenge, provisioning, and recovery plaintext ephemeral and scoped to the UI that needs them.
- Generate QR content locally and retain a usable manual setup fallback.
- Survive authentication-version token rotation without a stale-request logout race.
- Keep the implementation aligned with the existing auth feature and generic header/dialog primitives.

**Non-Goals:**

- Backend authentication-semantic changes beyond exposing the existing `Retry-After` response header to the browser; refresh tokens, trusted devices, remembered browsers, WebAuthn, SMS, or email OTP.
- A general account settings area or new protected route; management remains a focused dialog from the main header.
- Persisting or later retrieving recovery codes, provisioning secrets, or login challenges.
- Administrator-assisted factor reset or downloading recovery codes as a file.
- Changing the environment-token mechanism to support session rotation.

## Decisions

### Model password login as a discriminated response union

Define separate schemas for the authenticated-session response and the `{ requiresTwoFactor: true, challengeToken, expiresAt }` response, then parse password login as their union. Registration and challenge completion continue to require the authenticated-session shape. The login mutation returns the parsed branch to the UI and performs session side effects only for an authenticated response.

This preserves strict runtime validation while preventing a valid challenge from being mistaken for a malformed login response. Making every auth response optional or inspecting unvalidated fields was rejected because it weakens the current contract boundary.

### Keep the login challenge in an in-memory staged login flow

The login feature owns a `credentials | totp | recovery` stage and the active challenge. Password success with a challenge clears the password and transitions to `totp`; it does not write local storage or navigate. Challenge completion uses the original safe redirect only after the shared session-establishment path succeeds. Refreshing or leaving the page discards the challenge, and returning to credentials explicitly starts a new login.

Using a dedicated route with the challenge in search parameters was rejected because browser history, copied URLs, analytics, and screenshots could expose the token. Browser storage was rejected because the challenge is short-lived and intentionally not a session credential.

### Use separate factor forms over one shape-shifting field

TOTP and recovery views are separate form components backed by focused schemas. TOTP accepts exactly six digits and uses numeric and one-time-code input hints. Recovery accepts the backend's case-insensitive Crockford alphabet with optional spaces or hyphens and normalizes only for validation/submission. Switching methods preserves the active challenge but clears factor-specific errors and disables switching during submission.

Every six-digit TOTP entry surface uses the shared shadcn Input OTP composition so paste, focus movement, numeric filtering, and invalid styling remain consistent across login, confirmation, regeneration, and disabling. Slot sizing adapts at the smallest supported viewport so the control remains inside the dialog. Newly generated recovery codes are rendered as ten individually labelled, read-only inputs inside one fieldset in a two-column by five-row grid, preserving manual selection and copy-all behavior. The fieldset receives focus when the one-time recovery view opens so the new security-critical step is announced.

A single conditional form was rejected because its autocomplete, input mode, length, normalization, and error copy differ materially between methods. Shared model helpers may still centralize method and error mapping without coupling the UI states.

### Keep factor management in the auth feature and open it from the main header

Add a feature-level two-factor management trigger/dialog beside logout. The feature owns status querying, lifecycle mutations, forms, and ephemeral secrets. The main page composes the feature through the existing generic header action slot; shared UI remains domain-free. Status query data may cache only `status` and `recoveryCodesRemaining`.

A new settings route was rejected because there is no existing settings surface and TOTP is the only current account-security control. Moving the lifecycle API into `shared` was rejected because it is domain behavior. A separate entity slice can be introduced later if non-auth features begin consuming factor state.

### Restart pending enrollment when provisioning state is unavailable

An active setup response is held only in component memory. If status reports `pending` after a remount, the frontend cannot safely reconstruct the QR because the backend intentionally does not re-expose the secret or URI. The dialog explains this and offers password-authorized restart; the backend then replaces the pending setup.

Persisting provisioning values to resume setup was rejected because it extends the lifetime and exposure surface of the TOTP secret.

### Generate QR locally with a manual-secret fallback

Add a browser-local QR-generation dependency and pass the validated `otpauthUri` directly to it. No network-backed image endpoint, remote QR API, telemetry event, or diagnostic log may receive the URI or secret. The UI also displays a copyable Base32 secret so enrollment remains possible if QR rendering or camera scanning fails. Provisioning data is removed when setup completes, expires, restarts, or closes.

Backend QR generation was rejected because the backend contract explicitly leaves rendering to the frontend. A remote QR service was rejected because the URI embeds the credential secret.

### Treat recovery-code responses as one-time ephemeral results

Confirmation and regeneration parse `AuthResponse + recoveryCodes`, activate the replacement session, and then place the plaintext codes only in local component state. The dialog provides copy-all with success/failure feedback and prevents normal dismissal until the user acknowledges saving the codes. Dismissal removes the plaintext. Codes never enter TanStack Query, local/session storage, URLs, or logs.

Automatic file download was rejected to avoid silently creating a durable plaintext secret. Users can explicitly copy the set into their chosen secure storage.

### Defer dialog cleanup until the close transition completes

Closing the management dialog updates its controlled open state immediately but keeps the active view mounted until Base UI reports that the close transition has completed. Only then does the feature clear provisioning data, recovery plaintext, acknowledgement state, and the active management view. This prevents the dialog body and height from changing during its exit animation while preserving the rule that secrets are removed once dismissal completes. Dismissal is blocked while any authenticated lifecycle mutation is pending, because confirmation or regeneration can return the only plaintext copy of new recovery codes. Recovery codes are exposed immediately after the replacement session is installed, before status invalidation completes.

Management rate-limit deadlines live at the dialog level rather than inside individual forms, so navigating back or closing and reopening cannot reset `Retry-After`. A setup `409` returns the dialog to loading and refetches backend status. When setup expires, the provisioning form notifies the parent and transitions to a secret-free pending state, removing the URI, QR, and manual secret.

### Centralize replacement-session handling

Login completion, registration, setup confirmation, regeneration, and disabling use one helper that validates the response before storing its access token, resets unauthorized-session deduplication, and seeds the current-user query. Identity-changing flows continue clearing all query data; factor-management flows retain same-user finance data and update or invalidate only auth-related queries.

The unauthorized response path compares the Bearer token used by the rejected request with the currently active token. It ends the session only when they match. Public authentication detection includes `/auth/login/two-factor`, so its expected `401` stays inside the factor form. This token comparison is required even if management mutations cancel queries because already-dispatched requests can complete after rotation.

Clearing the entire cache after factor management was rejected because the authenticated identity does not change and the replacement response confirms the same user. Relying only on query cancellation was rejected because cancellation cannot eliminate every response race.

### Use status-aware errors and server-provided retry timing

Frontend validation distinguishes malformed TOTP, malformed recovery code, password constraints, and invalid response payloads. Backend `401` responses use intentionally broad copy such as "code or challenge is invalid or expired" rather than claiming knowledge the backend withholds. `409` means setup is already enabled, `503` means new enrollment is unavailable, and `429` reads `Retry-After` to communicate and enforce the temporary wait. All form-level results use announced alert/status regions.

The development CORS configuration exposes `Retry-After`; otherwise browser CORS filtering hides the header even though the backend sends it, leaving the frontend unable to enforce the authoritative wait. Same-origin production deployments are unaffected, but cross-origin deployments must preserve this exposure.

Trying to infer expired, exhausted, consumed, or unknown challenges from backend messages was rejected because the backend intentionally makes those responses indistinguishable.

### Hide factor management in environment-token mode

When `FRONT_USE_LOCAL_AUTH_TOKEN=true`, the effective token always comes from the environment and cannot be replaced by a lifecycle response stored in local storage. The frontend therefore hides factor management together with logout. Login routes remain bypassed as they are today.

Attempting lifecycle changes in this mode was rejected because successful token rotation would immediately leave the browser using a stale environment token.

### Verify model behavior separately from rendered flows

Add focused model tests for union parsing, factor validation/normalization, stage transitions, recovery acknowledgement, error mapping, retry timing, and stale-token unauthorized handling. Validate integration with lint, architecture lint, and production build. Manually exercise password-only login, TOTP login, recovery login, enrollment, refresh during pending setup, regeneration, disabling, token-rotation races, narrow layouts, keyboard navigation, and clipboard/QR fallbacks against the backend.

The repository has no configured component or browser test runner, so adding a broad testing framework is outside this change.

## Risks / Trade-offs

- **[A delayed request made with an invalidated token logs out the replacement session]** → Compare the rejected request token with the active token before clearing session state and cover the race with a focused test.
- **[Provisioning or recovery secrets outlive their intended UI]** → Keep them out of query caches, storage, URLs, and logs; explicitly clear local state at every terminal transition.
- **[The client clock differs from the server]** → Treat backend verification and expiration as authoritative; client-side expiry only disables obviously stale UI and offers restart.
- **[Clipboard or QR browser support fails]** → Keep recovery codes selectable and keep the manual Base32 secret visible with localized fallback feedback.
- **[Closing an unacknowledged recovery view loses the only plaintext copy]** → Block normal dismissal until acknowledgement and clearly explain the consequence; browser/process termination remains unavoidable.
- **[A challenge becomes exhausted while the form still appears active]** → Use broad `401` copy and a prominent restart-login action because backend responses intentionally conceal challenge state.
- **[The management dialog becomes a multi-step state machine]** → Keep status, setup, provisioning, recovery display, regeneration, and disabling as small explicit views rather than one large conditional form.

## Migration Plan

1. Add schemas and model helpers while preserving password-only and registration behavior.
2. Update public-auth detection and stale-token unauthorized handling before enabling token-rotating management flows.
3. Add challenge login and verify both password-only and two-factor accounts against the backend.
4. Add status and management UI, local QR generation, recovery display, regeneration, and disabling.
5. Deploy the frontend only after the backend login challenge and lifecycle endpoints are available; password-only users remain compatible throughout.
6. If rollback is required, disable new enrollment on the backend first. Do not roll the frontend back to a password-only login implementation while any user has enabled TOTP, because those users would be unable to complete login.
