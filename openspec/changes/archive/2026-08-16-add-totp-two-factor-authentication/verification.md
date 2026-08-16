# Verification report

Verified on 2026-08-16 with the frontend and backend feature branches, an isolated MongoDB database, generated test-only users, and the in-app browser. No production accounts or credentials were used. Provisioning secrets, challenge tokens, access tokens, and recovery codes are intentionally omitted from this report.

## Browser E2E matrix

| Area | Scenarios | Result |
| --- | --- | --- |
| Password login | Password-only account; invalid credentials; safe internal redirect; external redirect rejection | Pass |
| TOTP login | Valid code; malformed and invalid codes; expired challenge; exhausted challenge; refresh/back discards in-memory challenge | Pass |
| Recovery login | Normalized lowercase/spaced code; malformed and invalid codes; all ten codes consumed once; reused/exhausted code rejected; remaining count reaches zero | Pass |
| Concurrency | Same TOTP submitted from two independent challenges; same recovery code submitted from two tabs | Pass: exactly one request succeeds |
| Rate limiting | Login challenge and management lifecycle limits; persisted backend block; countdown; disabled submit and method switch; re-enable after wait | Pass after exposing `Retry-After` through backend CORS |
| Enrollment | Disabled, pending, enabled, unavailable and malformed/error states; wrong password/code; real `409` state conflict; local QR; manual secret; setup expiry/restart | Pass |
| Recovery display | Ten labelled read-only inputs in a 2 x 5 fieldset; initial focus; acknowledgement-gated dismissal; copy-all success and denial; plaintext removed after close | Pass |
| Lifecycle | Recovery regeneration; disable using TOTP and recovery code; wrong password/code; replacement-token continuity | Pass |
| Session races | Delayed `401` from an obsolete Bearer token released after setup confirmation rotates the JWT | Pass: replacement session remains active |
| Accessibility | Keyboard traversal, focus movement/containment, announced alert/status regions, labelled OTP/recovery controls, Escape dismissal guard | Pass |
| Responsive/fallback | Wide and 320 px layouts; no page-level horizontal overflow; QR renderer failure retains manual setup; clipboard denial retains selectable values | Pass |
| Environment-token mode | Login bypass; logout and two-factor management hidden | Pass |

## Defects found and resolved

- Expected `401` responses from setup, confirmation, regeneration, and disable no longer trigger global logout.
- Successful setup immediately seeds the safe `pending` status so closing and reopening the dialog cannot show stale `disabled` state.
- Backend development CORS now exposes `Retry-After`, allowing the existing frontend countdown and interaction lock to use the authoritative server duration.
- Clipboard controls expose a localized pending state and reject duplicate activation until the browser write settles.

## Automated verification

- Frontend model/regression suite: 67 passed.
- Frontend architecture lint: passed.
- Frontend production build: passed (existing chunk-size warnings only).
- Backend focused ESLint for the CORS change: passed.
- Backend unit suite: 26 suites, 158 tests passed.
- Backend TOTP E2E suite: 1 suite, 2 tests passed, including atomic parallel TOTP/recovery use, token revocation, persisted blocks, challenge one-use, and rollout gating.

Final frontend lint, strict OpenSpec validation, diff checks, and a clean rerun after removal of temporary E2E harness files are recorded by the completion run.
