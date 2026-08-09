## ADDED Requirements

### Requirement: Public login page
The system SHALL provide a localized login page at `/login` with labeled email and password fields, a submit action, and navigation to `/register`.

#### Scenario: Unauthenticated user opens login
- **WHEN** a user without a valid session navigates to `/login`
- **THEN** the system displays the login form and a link to the registration page

#### Scenario: Authenticated user opens login
- **WHEN** a user with a confirmed session navigates to `/login`
- **THEN** the system redirects the user to `/main`

### Requirement: Successful login
The system SHALL persist the returned access token, cache the returned current user, and navigate only after a valid login response is received.

#### Scenario: Login without a restored destination
- **WHEN** a user submits valid login credentials without a valid redirect query value
- **THEN** the system stores the session and navigates to `/main`

#### Scenario: Login restores an internal destination
- **WHEN** a user submits valid credentials with a redirect query value containing a valid internal application path
- **THEN** the system stores the session and navigates to that internal path

#### Scenario: Login rejects an external destination
- **WHEN** a successful login includes a redirect query value that is external, protocol-relative, or otherwise invalid
- **THEN** the system ignores that value and navigates to `/main`

### Requirement: Login failure feedback
The system SHALL retain entered login values and display localized, accessible feedback when authentication fails.

#### Scenario: Credentials are rejected
- **WHEN** `/auth/login` responds with `401`
- **THEN** the login page reports that the email or password is incorrect without invoking the expired-session redirect flow

#### Scenario: Login response is invalid
- **WHEN** `/auth/login` succeeds at the transport level but its payload does not match the expected authentication response schema
- **THEN** the login page reports a general retryable error and does not establish a session

#### Scenario: Login request fails unexpectedly
- **WHEN** the login request fails because of a network error, server error, or unrecognized response
- **THEN** the login page reports a general retryable error without clearing the entered values

### Requirement: Public registration page
The system SHALL provide a localized registration page at `/register` containing only required first name, last name, email, password, and currency controls, plus navigation to `/login`.

#### Scenario: Registration form defaults
- **WHEN** an unauthenticated user opens `/register`
- **THEN** the system displays the required registration fields with currency initialized to `RUB`

#### Scenario: Authenticated user opens registration
- **WHEN** a user with a confirmed session navigates to `/register`
- **THEN** the system redirects the user to `/main`

### Requirement: Successful registration
The system SHALL create and establish the new session from a schema-valid registration response.

#### Scenario: User registers successfully
- **WHEN** a user submits valid first name, last name, email, password, and currency values and `/auth/register` returns a valid authentication response
- **THEN** the system persists the token, caches the returned user, and navigates to `/main`

#### Scenario: Optional profile values are omitted
- **WHEN** the registration form submits its payload
- **THEN** the system omits birth date and notes from the registration request

### Requirement: Registration failure feedback
The system SHALL preserve registration input and display localized, accessible feedback when account creation fails.

#### Scenario: Email is already registered
- **WHEN** `/auth/register` responds with `409`
- **THEN** the registration page reports that the email is already associated with an account

#### Scenario: Registration response is invalid
- **WHEN** `/auth/register` succeeds at the transport level but its payload does not match the expected authentication response schema
- **THEN** the registration page reports a general retryable error and does not establish a session

#### Scenario: Registration request fails unexpectedly
- **WHEN** the registration request fails because of a network error, server error, or unrecognized response
- **THEN** the registration page reports a general retryable error without clearing the entered values

### Requirement: Authentication form validation
The system SHALL validate authentication fields before submission using the frontend schemas that define the request contracts.

#### Scenario: Required registration identity is missing
- **WHEN** first name or last name is empty or contains only whitespace
- **THEN** the registration form displays a field-level required error and does not submit

#### Scenario: Email is invalid
- **WHEN** a login or registration email is not a valid email address
- **THEN** the form displays a field-level email error and does not submit

#### Scenario: Password is too short
- **WHEN** a login or registration password contains fewer than 8 characters
- **THEN** the form displays a field-level password error and does not submit

#### Scenario: Registration value exceeds its contract
- **WHEN** a first or last name exceeds 100 characters, a password exceeds 128 characters, or currency is not a three-letter code
- **THEN** the registration form displays the corresponding field error and does not submit

#### Scenario: Authentication submission is pending
- **WHEN** a login or registration mutation is in progress
- **THEN** the system disables the form controls and displays a progress-specific submit label

### Requirement: Password visibility control
The system SHALL provide an accessible visibility toggle for the password fields on the login and registration forms.

#### Scenario: Password is masked by default
- **WHEN** a user opens the login or registration form
- **THEN** the password field masks its value and the toggle offers to show the password

#### Scenario: User toggles password visibility
- **WHEN** the user activates the eye-icon toggle
- **THEN** the field switches between masked and visible text without changing its value, validation state, or autocomplete behavior

#### Scenario: Visibility toggle accessibility and pending state
- **WHEN** the visibility toggle is available or the authentication form is submitting
- **THEN** the toggle exposes a localized action label, reflects its pressed state, has visible keyboard focus, and is disabled together with the form controls

### Requirement: Protected route access
The system SHALL place `/main` and future private finance routes behind one route-level session boundary that confirms the current user.

#### Scenario: User without a token opens a private route
- **WHEN** a user without an access token navigates to a protected route
- **THEN** the system redirects to `/login` with the requested internal location encoded as the redirect query value

#### Scenario: User with a valid token opens a private route
- **WHEN** a user with an access token navigates to a protected route and `/users/me` confirms the session
- **THEN** the system renders the protected route using the confirmed current-user data

#### Scenario: Root route is opened without a session
- **WHEN** a user without a valid session navigates to `/`
- **THEN** the system redirects to `/login`

#### Scenario: Root route is opened with a session
- **WHEN** a user with a confirmed session navigates to `/`
- **THEN** the system redirects to `/main`

### Requirement: Expired session handling
The system SHALL end a stored session when an authenticated resource request returns `401` and SHALL preserve a safe return destination.

#### Scenario: Authenticated request is rejected
- **WHEN** a non-auth endpoint request carrying the user's Bearer token responds with `401`
- **THEN** the system clears the stored token and all query data and replaces the current route with `/login` carrying the current internal location as the redirect value

#### Scenario: Multiple requests reject the same session
- **WHEN** concurrent authenticated requests respond with `401`
- **THEN** the system performs one effective session invalidation and does not start competing redirects

#### Scenario: Current-user check rejects a token
- **WHEN** `/users/me` responds with an authentication failure while confirming a protected navigation
- **THEN** the system does not retry the authentication failure, clears the session, and redirects to login

### Requirement: User logout
The system SHALL expose a logout action in the authenticated main-page header and SHALL remove all user-specific client state when activated.

#### Scenario: User logs out
- **WHEN** an authenticated user activates logout
- **THEN** the system clears the stored access token and entire query cache and replaces the current route with `/login`

#### Scenario: Browser history after logout
- **WHEN** a logged-out user navigates backward to a previously protected location
- **THEN** the protected route guard redirects the user to login instead of rendering cached private data

### Requirement: Local development token mode
The system SHALL preserve environment-provided local authentication behavior when `FRONT_USE_LOCAL_AUTH_TOKEN=true`.

#### Scenario: Local token mode opens an auth page
- **WHEN** a valid environment-provided local token is active and the user navigates to `/login` or `/register`
- **THEN** the system bypasses the auth page and navigates to `/main`

#### Scenario: Local token mode displays authenticated navigation
- **WHEN** the application uses an environment-provided local token
- **THEN** the main-page header does not display logout because local storage cannot end that session

### Requirement: Responsive and accessible authentication UI
The system SHALL present authentication pages as a two-column brand-and-form layout on wide screens and a single-column layout on narrow screens, using accessible form semantics.

#### Scenario: Wide viewport
- **WHEN** an authentication page is rendered at a wide viewport
- **THEN** the system displays product messaging beside the authentication form

#### Scenario: Narrow viewport
- **WHEN** an authentication page is rendered at a narrow viewport
- **THEN** the system places a compact brand header above a full-width form without horizontal overflow

#### Scenario: Keyboard and assistive technology use
- **WHEN** a user navigates an authentication form by keyboard or submits invalid values
- **THEN** controls follow logical tab order, labels identify their controls, focus remains visible, and validation or form-level errors are announced accessibly
