## Why

The backend now supports optional TOTP two-factor authentication, but the frontend still assumes every successful password login immediately returns an access token and provides no way to enroll, recover, or manage a factor. The frontend must adopt the new authentication contracts without leaking provisioning secrets or allowing stale requests to invalidate a newly rotated session.

## What Changes

- **BREAKING** Update password login handling to accept either the existing authenticated-session response or a short-lived two-factor challenge.
- Add a second login step with separate TOTP and recovery-code forms, including controls to switch between the two methods and restart password login.
- Add authenticated two-factor management UI for status inspection, enrollment, confirmation, disabling, and recovery-code regeneration.
- Generate the enrollment QR code locally from the backend-provided `otpauthUri`, while retaining the Base32 secret as a manual setup option.
- Display newly generated recovery codes once, support copying them as a set, and require explicit acknowledgement before dismissing them.
- Adopt replacement access tokens returned after enrollment confirmation, disabling, and recovery-code regeneration.
- Prevent delayed `401` responses sent with an obsolete Bearer token from clearing a newer session, and treat the two-factor login endpoint as public authentication traffic.
- Add localized validation, expiry, invalid-code, rate-limit, recovery-code, and setup-management feedback.

## Capabilities

### New Capabilities

- `totp-two-factor-authentication`: TOTP enrollment, frontend QR generation, recovery-code presentation, status inspection, disabling, regeneration, and authentication-token rotation.

### Modified Capabilities

- `user-authentication`: Extend login from a password-only session response to a two-step TOTP or recovery-code flow while preserving redirects, session establishment, error handling, and local-token development behavior.

## Impact

- Affects `src/features/auth/`, the login page flow, authenticated header actions, shared unauthorized-session handling, localization resources, and auth/session schemas.
- Integrates all backend `/auth/two-factor` and `/auth/login/two-factor` contracts.
- Adds a client-side QR-generation dependency; provisioning data must never be sent to an external QR service or logged.
- Requires focused model tests plus `npm run lint`, `npm run lint:architecture`, `npm run build`, and manual responsive/auth-flow verification.
- Does not change backend code, introduce a settings route, or alter the generated TanStack Router tree directly.
