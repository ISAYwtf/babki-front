## 1. Authentication contracts and validation

- [x] 1.1 Add failing model tests for the password-login response union, challenge token and expiration validation, authenticated responses with recovery codes, status/setup responses, six-digit TOTP values, and formatted recovery-code normalization.
- [x] 1.2 Implement strict Zod schemas and inferred DTO/response types for password login, challenge completion, status, setup, confirmation, disabling, and recovery regeneration; keep registration on the authenticated-session response only.
- [x] 1.3 Extend the auth API client with all `/auth/login/two-factor` and `/auth/two-factor` calls, parsing request and response payloads at the transport boundary and never logging provisioning or recovery values.
- [x] 1.4 Add status query options and lifecycle mutations with focused query-key behavior, leaving provisioning secrets and plaintext recovery codes out of TanStack Query data.

## 2. Session replacement and unauthorized-response safety

- [x] 2.1 Add failing unauthorized-session tests proving `/auth/login/two-factor` is public, a `401` for the active token invalidates once, and a delayed `401` for an obsolete token cannot clear a replacement session.
- [x] 2.2 Update shared unauthorized-session handling and the Axios response path to compare the rejected Bearer token with the currently effective token before dispatching invalidation while preserving concurrent-response deduplication.
- [x] 2.3 Extract one authenticated-response handler used by registration, password-only login, challenge completion, setup confirmation, regeneration, and disabling; distinguish identity-changing cache clearing from same-user token replacement.
- [x] 2.4 Add focused tests proving replacement-token activation, current-user cache seeding, deduplication reset, and preservation of same-user finance query data.

## 3. Two-step login flow

- [x] 3.1 Add failing model tests for `credentials`, `totp`, and `recovery` transitions, password clearing after challenge issuance, challenge disposal on restart/remount, method switching, safe redirect preservation, and pending-state guards.
- [x] 3.2 Refactor password login so authenticated responses establish the session immediately while challenge responses remain in memory, clear the password, expose expiration, and open the default TOTP step without navigation.
- [x] 3.3 Build the accessible six-digit TOTP form with numeric and one-time-code hints, localized validation, pending state, retry feedback, and actions for recovery entry and restarting password login.
- [x] 3.4 Build the separate recovery-code form with case-insensitive grouped input, normalization, localized validation, pending state, and an action for returning to TOTP without replacing the challenge.
- [x] 3.5 Map challenge `401`, `429` plus `Retry-After`, invalid payload, network, and server failures to accessible localized feedback; enforce the temporary retry wait and retain only retry-safe state.
- [x] 3.6 Complete successful TOTP and recovery login through the shared authenticated-response handler and restore only a safe internal destination.

## 4. Two-factor management shell and status

- [x] 4.1 Add failing view-model tests for disabled, pending-without-provisioning, enabled, loading, error, setup, confirmation, recovery-display, regeneration, and disable management states.
- [x] 4.2 Add a feature-level two-factor management trigger and responsive dialog, compose it beside logout through the main-page header action slot, and hide it when environment-token mode is active.
- [x] 4.3 Load status on demand, display the unused recovery-code count for enabled accounts, provide retry on failure, and never infer `disabled` from a missing or invalid response.
- [x] 4.4 For a pending status without in-memory provisioning values, explain why the setup cannot resume and route restart through a new password-authorized setup request.

## 5. Enrollment and local QR provisioning

- [x] 5.1 Add a browser-local QR dependency and failing focused tests or an isolated adapter contract proving the validated `otpauthUri` is rendered without network access and QR failure preserves manual setup.
- [x] 5.2 Build the current-password setup form with `401`, `409`, `503`, `429`, invalid-response, and retryable failure handling.
- [x] 5.3 Build the provisioning view with locally generated QR, copyable Base32 secret, setup expiration, manual-entry guidance, and explicit cleanup when setup completes, expires, restarts, or closes.
- [x] 5.4 Build the six-digit confirmation form, treat the backend as expiration authority, disable obviously expired client state, and route successful confirmation through replacement-session handling.
- [x] 5.5 Verify provisioning URI and secret values never enter browser storage, URLs, query cache, error serialization, analytics, or diagnostic logs.

## 6. Recovery-code presentation and lifecycle management

- [x] 6.1 Add failing model tests for ten-code response validation, copy-all formatting, acknowledgement-gated dismissal, clipboard failure, and plaintext cleanup at every terminal transition.
- [x] 6.2 Build the one-time recovery-code view with selectable formatted codes, security guidance, copy-all feedback, explicit saved acknowledgement, dismissal protection, and state cleanup.
- [x] 6.3 Build recovery regeneration with current password plus TOTP only, adopt its replacement session, refresh the remaining count, and reuse the one-time recovery-code view.
- [x] 6.4 Build TOTP disabling with current password plus a TOTP/recovery method switch, adopt its replacement session, refresh status to disabled, and clear factor-specific state.
- [x] 6.5 Map lifecycle `401`, `409`, `503`, `429` plus `Retry-After`, invalid payload, network, and server failures to localized accessible messages without claiming a state transition that was not confirmed.

## 7. Localization, accessibility, and responsive behavior

- [x] 7.1 Add Russian labels, descriptions, validation messages, progress text, expiry guidance, rate-limit feedback, QR/manual setup copy, recovery warnings, clipboard results, and management-state copy.
- [x] 7.2 Verify focus moves to each newly active login or management step, dialog focus remains contained and recoverable, errors use announced regions, method switches expose their purpose, and secret/code controls have meaningful labels.
- [x] 7.3 Verify TOTP, recovery, QR, manual secret, and recovery-code layouts fit narrow viewports without page-level horizontal overflow and remain clear within the existing wide auth shell.

## 8. Integration and release verification

- [x] 8.1 Run the repository's focused lightweight model tests for auth contracts, staged login, session replacement, stale-token rejection, recovery handling, retry timing, and QR/clipboard adapters; resolve all failures.
- [x] 8.2 Run `npm run lint`, `npm run lint:architecture`, and `npm run build`, resolving reported issues without manually editing `src/routeTree.gen.ts`.
- [x] 8.3 Manually verify password-only, TOTP, and recovery login; safe redirect restoration; invalid, expired, exhausted, and rate-limited challenges; and browser refresh/back behavior against the backend.
- [x] 8.4 Manually verify disabled, pending, enabled, unavailable, and rate-limited management states; enrollment and QR/manual fallback; one-time recovery acknowledgement; regeneration; disabling with both methods; and replacement-token continuity.
- [x] 8.5 Manually verify keyboard and screen-reader semantics, clipboard denial, QR rendering failure, wide/narrow layouts, local environment-token mode, and delayed old-token `401` responses without exposing authentication material.
- [x] 8.6 Confirm the backend rollout supports challenge login before deployment and document that the frontend must not roll back to password-only login while any user has enabled TOTP.

## 9. Testing-feedback refinements

- [x] 9.1 Add regression coverage, block dismissal during lifecycle mutations, and defer management-state cleanup until the dialog close transition completes, keeping exit height stable.
- [x] 9.2 Add the shadcn Input OTP component and use one responsive shared six-digit control for login, confirmation, regeneration, and TOTP-based disabling.
- [x] 9.3 Render newly generated recovery codes as ten labelled read-only inputs in a semantic fieldset arranged in a two-column by five-row grid and focus the group on entry.
- [x] 9.4 Re-run focused tests, lint, architecture lint, production build, strict OpenSpec validation, and manual dialog verification.
