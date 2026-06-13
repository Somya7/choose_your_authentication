# Authentication Types Reference

A catalog of authentication methods we'll implement in this repo. Each uses the same Notes app so you can compare flows, storage, and tradeoffs.

## Categories

### Knowledge-based
Proves identity via something the user **knows**.

| Method | Description | Project |
|--------|-------------|---------|
| Username + password | Classic credentials; passwords stored as salted hashes | `01-password-auth` (complete) |

### Session & token-based
Proves identity via a **credential issued after login**.

| Method | Description | Project |
|--------|-------------|---------|
| Session cookies | Server-side session; browser holds session ID in HttpOnly cookie | `02-session-cookies` (complete) |
| JWT | Stateless signed tokens; access + refresh token pattern | `03-jwt` (planned) |

### Delegated / federated
Proves identity via a **trusted third party**.

| Method | Description | Project |
|--------|-------------|---------|
| OAuth 2.0 / OIDC | "Sign in with Google/GitHub"; authorization code + PKCE | `04-oauth` (planned) |

### Passwordless
Proves identity via **possession of email/device** without a password.

| Method | Description | Project |
|--------|-------------|---------|
| Magic link | One-time login URL sent to email | `05-magic-link` (planned) |
| Email OTP | Short numeric code with expiry | `05-magic-link` (planned) |

### Strong authentication
Proves identity via **cryptographic credentials**.

| Method | Description | Project |
|--------|-------------|---------|
| WebAuthn / Passkeys | Public-key crypto; phishing-resistant | `06-webauthn` (planned) |

### Authorization (after authentication)
Determines **what an authenticated user can do**.

| Method | Description | Project |
|--------|-------------|---------|
| RBAC | Role-based access (e.g. user vs admin) | `07-rbac` (planned) |

### Machine / service auth
Proves identity for **non-human clients**.

| Method | Description | Project |
|--------|-------------|---------|
| API keys | Scoped keys for programmatic access | `08-api-keys` (planned) |

## What to document per implementation

For each method, capture:

1. **Flow diagram** — login → credential → protected request
2. **Storage** — what lives in DB, cookies, client memory
3. **Threat model** — XSS, CSRF, token theft, session fixation
4. **Logout** — does it actually revoke access?
5. **When to use** — production tradeoffs

## Consistent app surface

Every implementation exposes the same API shape:

| Endpoint | Auth required | Purpose |
|----------|---------------|---------|
| `POST /api/auth/register` | No | Create account |
| `POST /api/auth/login` | No | Establish session/token |
| `POST /api/auth/logout` | Yes | End session |
| `GET /api/auth/me` | Yes | Current user |
| `GET /api/notes` | Yes | List user's notes |
| `POST /api/notes` | Yes | Create a note |

Only the **auth mechanism** changes between projects.
