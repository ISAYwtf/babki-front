## MODIFIED Requirements

### Requirement: Successful login
The system SHALL distinguish a schema-valid authenticated-session response from a schema-valid two-factor challenge, establish a session only after an authenticated-session response, and navigate only after authentication is complete.

#### Scenario: Login without a restored destination
- **WHEN** a user completes password-only or two-factor login without a valid redirect query value
- **THEN** the system stores the returned access token, caches the current user, and navigates to `/main`

#### Scenario: Login restores an internal destination
- **WHEN** a user completes password-only or two-factor login with a redirect query value containing a valid internal application path
- **THEN** the system stores the returned access token, caches the current user, and navigates to that internal path

#### Scenario: Password login requires a second factor
- **WHEN** a user with enabled TOTP submits valid login credentials and receives a two-factor challenge
- **THEN** the system does not establish a session or navigate and instead displays the TOTP step for that challenge

#### Scenario: Login rejects an external destination
- **WHEN** a completed password-only or two-factor login includes a redirect query value that is external, protocol-relative, or otherwise invalid
- **THEN** the system ignores that value and navigates to `/main`

### Requirement: Expired session handling
The system SHALL end a stored session only when an authenticated resource request made with the currently active Bearer token returns `401`, and SHALL preserve a safe return destination.

#### Scenario: Authenticated request is rejected
- **WHEN** a non-public-auth endpoint request carrying the currently active Bearer token responds with `401`
- **THEN** the system clears the stored token and all query data and replaces the current route with `/login` carrying the current internal location as the redirect value

#### Scenario: Multiple requests reject the same session
- **WHEN** concurrent authenticated requests carrying the same active token respond with `401`
- **THEN** the system performs one effective session invalidation and does not start competing redirects

#### Scenario: Current-user check rejects a token
- **WHEN** `/users/me` responds with an authentication failure while confirming a protected navigation with the active token
- **THEN** the system does not retry the authentication failure, clears the session, and redirects to login

#### Scenario: Obsolete request fails after token rotation
- **WHEN** a request made with an earlier Bearer token returns `401` after a replacement access token has become active
- **THEN** the system ignores that stale rejection and preserves the replacement session and its query data

#### Scenario: Public two-factor login is rejected
- **WHEN** `/auth/login/two-factor` responds with `401`
- **THEN** the system reports the failure inside the login flow without invoking expired-session handling

### Requirement: Local development token mode
The system SHALL preserve environment-provided local authentication behavior when `FRONT_USE_LOCAL_AUTH_TOKEN=true` and SHALL hide session or factor management actions that cannot replace or clear that environment token.

#### Scenario: Local token mode opens an auth page
- **WHEN** a valid environment-provided local token is active and the user navigates to `/login` or `/register`
- **THEN** the system bypasses the auth page and navigates to `/main`

#### Scenario: Local token mode displays authenticated navigation
- **WHEN** the application uses an environment-provided local token
- **THEN** the main-page header does not display logout or two-factor management actions

### Requirement: Responsive and accessible authentication UI
The system SHALL present password and second-factor authentication steps as responsive localized forms with accessible semantics and feedback.

#### Scenario: Wide viewport
- **WHEN** an authentication step is rendered at a wide viewport
- **THEN** the system displays product messaging beside the active authentication form

#### Scenario: Narrow viewport
- **WHEN** an authentication step is rendered at a narrow viewport
- **THEN** the system places a compact brand header above a full-width form without horizontal overflow

#### Scenario: Keyboard and assistive technology use
- **WHEN** a user navigates a password, TOTP, or recovery form by keyboard or submits invalid values
- **THEN** controls follow logical tab order, labels identify their controls, focus remains visible, and validation or form-level errors are announced accessibly

## ADDED Requirements

### Requirement: Two-factor login challenge
The system SHALL keep a two-factor login challenge only in the active login flow, default the challenge to TOTP entry, expose its expiration, and never persist the challenge as an access token, URL value, or browser-storage value.

#### Scenario: Challenge is received
- **WHEN** password login returns `requiresTwoFactor: true`, a schema-valid challenge token, and an expiration time
- **THEN** the system clears the retained password, keeps the challenge in memory, and presents the TOTP form without storing an authenticated session

#### Scenario: Login page is refreshed during a challenge
- **WHEN** the browser reloads or remounts the login page while a challenge is active
- **THEN** the challenge is discarded and the user is returned to the email-and-password step

#### Scenario: User restarts password login
- **WHEN** the user chooses to return from the second-factor step to password login
- **THEN** the system discards the active challenge and requires new primary credentials

### Requirement: TOTP and recovery login methods
The system SHALL provide separate TOTP and recovery-code forms for the active challenge and SHALL allow the user to switch between them without requesting a new challenge.

#### Scenario: TOTP is submitted
- **WHEN** the user enters exactly six decimal digits and submits the default TOTP form
- **THEN** the system accepts the value through the shared accessible Input OTP control and completes the challenge using method `totp` and the entered code

#### Scenario: User selects recovery login
- **WHEN** the user activates the recovery-code action from the TOTP form
- **THEN** the system displays a labeled recovery-code form and an action for returning to TOTP

#### Scenario: Recovery code is submitted
- **WHEN** the user enters a case-insensitive recovery code with optional spaces or hyphens
- **THEN** the system validates and normalizes the value and completes the same challenge using method `recovery`

#### Scenario: Second-factor submission is pending
- **WHEN** a TOTP or recovery-code request is in progress
- **THEN** the system disables the active form controls and method-switching actions and displays a progress-specific submit label

### Requirement: Two-factor login failure feedback
The system SHALL retain the active challenge after retryable factor failures and display localized, accessible guidance without exposing protected challenge state.

#### Scenario: Factor or challenge is rejected
- **WHEN** challenge completion responds with `401`
- **THEN** the system reports that the code or login challenge is invalid or expired, retains the entered method, and offers to retry or restart login

#### Scenario: Factor verification is rate-limited
- **WHEN** challenge completion responds with `429` and a `Retry-After` value
- **THEN** the system reports the temporary block and prevents immediate resubmission for the indicated interval

#### Scenario: Challenge response is invalid
- **WHEN** challenge completion succeeds at the transport level but does not match the authenticated-session schema
- **THEN** the system reports a general retryable error and does not establish a session
