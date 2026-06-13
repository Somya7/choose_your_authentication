# Project 2: Session Cookies

Deep dive into **how the server remembers you** after password login — cookies, session storage, fixation attacks, and CSRF.

Project 1 verified your password. Project 2 focuses on what happens **after** that: the session.

## What changed from Project 1

| Before (Project 1) | After (Project 2) |
|--------------------|-------------------|
| In-memory session store | **SQLite session store** — survives API restart |
| Session ID reused on login | **Session regeneration** — new ID on login (fixes fixation) |
| No CSRF protection | **CSRF tokens** on mutating requests |
| No session visibility | **`/session` page** + `GET /api/auth/session` |

## The session model

```
Browser                          Server
───────                          ──────
Cookie: connect.sid=abc123  →    SQLite sessions table
                                 { userId, csrfToken, createdAt, ... }
```

The browser stores **only the session ID**. All sensitive data stays on the server.

## Key concepts

### 1. HttpOnly cookie

```typescript
cookie: { httpOnly: true }
```

JavaScript cannot read this cookie. Even if an XSS attack runs on your page, it cannot steal the session ID from `document.cookie`.

### 2. SameSite

```typescript
cookie: { sameSite: "lax" }
```

The cookie is **not sent** on cross-site POST requests from other domains. This reduces CSRF risk (used together with CSRF tokens).

| Value | Behavior |
|-------|----------|
| `strict` | Never sent on cross-site navigation |
| `lax` | Sent on top-level GET navigation (links), not cross-site POST |
| `none` | Sent everywhere (requires `secure: true`) |

### 3. Secure

```typescript
cookie: { secure: process.env.NODE_ENV === "production" }
```

In production, cookie only sent over HTTPS. Disabled on localhost because dev uses HTTP.

### 4. Session regeneration (fixation prevention)

**Session fixation attack:** Attacker gives victim a known session ID → victim logs in → attacker uses same ID.

**Fix:** On login/register, call `req.session.regenerate()` to issue a **new** session ID before storing `userId`.

```typescript
await regenerateSession(req);      // new session ID
assignUserSession(req, user.id);   // store userId + csrfToken
```

### 5. SQLite session store

Default express-session uses **RAM**. Restart the server → everyone logged out.

We now persist sessions in SQLite (`better-sqlite3-session-store`) using the same database file as users/notes. Sessions survive API restarts.

### 6. CSRF protection

**Problem:** If you're logged in, your browser sends cookies automatically — even if a malicious site triggers a request.

**Solution:** Synchronizer token pattern:

1. Server stores random `csrfToken` in the session
2. Client sends it back in `X-CSRF-Token` header on POST/PUT/DELETE
3. Attacker's site cannot read the token (same-origin policy)

Login/register are **exempt** — no session exists yet when those run.

## API endpoints

| Method | Path | CSRF required | Description |
|--------|------|---------------|-------------|
| GET | `/api/auth/session` | No | Session + cookie metadata for learning |
| GET | `/api/auth/me` | No | Current user + csrfToken |
| POST | `/api/auth/logout` | **Yes** | Destroy server session + clear cookie |
| POST | `/api/notes` | **Yes** | Create note |

## Files to read

| File | Purpose |
|------|---------|
| `apps/api/src/lib/session.ts` | Session store + cookie config |
| `apps/api/src/middleware/csrf.ts` | CSRF validation |
| `apps/api/src/routes/auth.ts` | Regenerate on login, session endpoint |
| `apps/web/src/pages/SessionPage.tsx` | Visual session inspector |
| `apps/web/src/lib/api.ts` | Sends `X-CSRF-Token` header |

## Try it

```bash
npm run dev
```

1. Log in at http://localhost:5173/login
2. Visit http://localhost:5173/session — inspect cookie attributes
3. Open DevTools → Application → Cookies → `connect.sid`
4. **Restart the API** — refresh the page — you're still logged in
5. Log out — cookie cleared, `/notes` redirects to login

## Logout semantics

Logout must do **both**:

1. `req.session.destroy()` — remove session from SQLite
2. `res.clearCookie('connect.sid', ...)` — tell browser to delete cookie

If you only destroy the server session but forget `clearCookie`, the browser still sends a stale ID (harmless but confusing).

## What's next: Project 3 — JWT

Sessions store state **on the server**. JWT moves identity into a **signed token** the client holds — stateless, different tradeoffs.

We'll rebuild auth using access + refresh tokens and compare when to pick sessions vs JWT.
