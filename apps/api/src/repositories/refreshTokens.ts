import { db } from "../db/index.js";
import { hashRefreshToken } from "../lib/jwt.js";

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

/**
 * Persists a refresh token hash so we can revoke it on logout.
 * The plaintext token only lives in the HttpOnly cookie — never in the DB.
 */
export function storeRefreshToken(
  userId: string,
  plainToken: string,
  expiresAt: Date,
): void {
  const id = crypto.randomUUID();
  const tokenHash = hashRefreshToken(plainToken);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, userId, tokenHash, expiresAt.toISOString(), now);
}

/**
 * Looks up a refresh token by its hash. Returns userId if valid and not expired.
 */
export function findUserIdByRefreshToken(plainToken: string): string | null {
  const tokenHash = hashRefreshToken(plainToken);
  const row = db
    .prepare(
      `SELECT user_id, expires_at FROM refresh_tokens
       WHERE token_hash = ?`,
    )
    .get(tokenHash) as Pick<RefreshTokenRow, "user_id" | "expires_at"> | undefined;

  if (!row) return null;

  if (new Date(row.expires_at) < new Date()) {
    revokeRefreshToken(plainToken);
    return null;
  }

  return row.user_id;
}

/** Logout: delete the refresh token so it can't be used again. */
export function revokeRefreshToken(plainToken: string): void {
  const tokenHash = hashRefreshToken(plainToken);
  db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").run(tokenHash);
}

/** Logout everywhere: revoke all refresh tokens for a user. */
export function revokeAllRefreshTokens(userId: string): void {
  db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").run(userId);
}

/** Cleanup job — remove expired tokens from DB. */
export function purgeExpiredRefreshTokens(): void {
  db.prepare("DELETE FROM refresh_tokens WHERE expires_at < ?").run(
    new Date().toISOString(),
  );
}
