# Choose Your Authentication

Learn authentication by building — one method at a time.

Each implementation uses the same **Notes app** so you can compare how identity is established without relearning unrelated features.

## Monorepo structure

```
choose_your_authentication/
├── apps/
│   ├── api/          # Express backend
│   └── web/          # React frontend (Vite)
├── packages/
│   └── shared/       # Shared types between api and web
└── docs/
    └── auth-types.md # Authentication methods reference
```

## Prerequisites

- Node.js 20+
- npm 10+

## Getting started

```bash
# Install all workspace dependencies
npm install

# Run API (port 3001) and web (port 5173) together
npm run dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3001 |
| API health | http://localhost:3001/api/health |

## Learning path

| # | Method | Status |
|---|--------|--------|
| 1 | Username + password (hashed) | Complete |
| 2 | Session cookies | Complete |
| 3 | JWT access + refresh tokens | Up next |
| 4 | OAuth 2.0 / OIDC (social login) | Not started |
| 5 | Magic link / email OTP | Not started |
| 6 | WebAuthn / Passkeys | Not started |
| 7 | RBAC authorization | Not started |
| 8 | API keys (service auth) | Not started |

See [docs/auth-types.md](./docs/auth-types.md) for details on each method.

**Project 1 walkthrough:** [docs/projects/01-password-auth.md](./docs/projects/01-password-auth.md)

**Project 2 walkthrough:** [docs/projects/02-session-cookies.md](./docs/projects/02-session-cookies.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and web in parallel |
| `npm run dev:api` | Start Express API only |
| `npm run dev:web` | Start React dev server only |
| `npm run build` | Build both apps for production |
| `npm run typecheck` | Type-check API and web |
