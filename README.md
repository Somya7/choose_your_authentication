# Choose Your Authentication

An interactive **authentication playground** — compare how different auth methods work side by side.

Pick a method from the UI, log in, create notes, and explore how credentials are stored and sent.

## Monorepo structure

```
choose_your_authentication/
├── apps/
│   ├── api/          # Express — parallel auth routes per method
│   └── web/          # React — auth method picker + explore views
├── packages/
│   └── shared/       # Types + auth method catalog
└── docs/
    ├── auth-types.md
    └── projects/     # Per-method walkthroughs
```

## Getting started

```bash
npm install
npm run dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3001 |
| Auth methods | http://localhost:3001/api/auth/methods |

## How the playground works

Each auth method has **its own API routes** and **independent login state**:

| Method | Auth routes | Notes routes | Credential |
|--------|-------------|--------------|------------|
| Session cookies | `/api/auth/session/*` | `/api/session/notes` | `connect.sid` cookie + CSRF |
| JWT | `/api/auth/jwt/*` | `/api/jwt/notes` | Bearer token + refresh cookie |

Use the **Auth method** dropdown in the header to switch. Switching logs you out of the current method and restores state for the new one.

## Auth methods

| # | Method | Status |
|---|--------|--------|
| 1 | Password hashing (shared) | Built into all methods |
| 2 | Session cookies | **Available** |
| 3 | JWT access + refresh | **Available** |
| 4 | OAuth 2.0 / OIDC | Coming soon |
| 5 | Magic link / OTP | Coming soon |
| 6 | WebAuthn / Passkeys | Coming soon |
| 7 | RBAC authorization | Coming soon |
| 8 | API keys | Coming soon |

## Walkthroughs

- [Project 1 — Password auth](./docs/projects/01-password-auth.md)
- [Project 2 — Session cookies](./docs/projects/02-session-cookies.md)
- [Project 3 — JWT tokens](./docs/projects/03-jwt.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and web |
| `npm run build` | Production build |
| `npm run typecheck` | Type-check all packages |
