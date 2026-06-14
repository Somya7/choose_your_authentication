import jwt from "jsonwebtoken";
import crypto from "node:crypto";

/** Short-lived token sent in Authorization header on every API request. */
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/** Long-lived token stored in HttpOnly cookie — used only to mint new access tokens. */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const REFRESH_COOKIE_NAME = "cyoa.refresh";

const accessSecret =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me";
const refreshSecret =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";

export interface AccessTokenPayload {
  sub: string; // user id — JWT standard claim name ("subject")
  type: "access";
}

/**
 * Signs a JWT access token. The payload is encoded in the token itself
 * (stateless) — the server verifies the signature instead of looking up a session.
 */
export function signAccessToken(userId: string): string {
  const payload: AccessTokenPayload = { sub: userId, type: "access" };
  return jwt.sign(payload, accessSecret, {
    expiresIn: ACCESS_TOKEN_TTL_MS / 1000,
  });
}

/**
 * Verifies an access token and returns the user id, or null if invalid/expired.
 */
export function verifyAccessToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, accessSecret) as AccessTokenPayload;
    if (decoded.type !== "access") return null;
    return decoded.sub;
  } catch {
    // jwt.verify throws on expiry, bad signature, malformed token, etc.
    return null;
  }
}

/** Returns expiry timestamp from a JWT without verifying (for display only). */
export function getAccessTokenExpiry(token: string): Date | null {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === "string" || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const, // stricter than lax — refresh cookie never sent cross-site
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: "/api/auth/jwt", // only sent to JWT auth routes (refresh/logout)
  };
}

/** Opaque refresh token — random string, NOT a JWT. Stored hashed in DB for revocation. */
export function generateOpaqueRefreshToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

/** Hash before storing — if DB leaks, refresh tokens can't be reused. */
export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Optional: sign refresh as JWT too (we use opaque + DB instead for easy logout).
 * Kept to show the alternative — not used in our flow.
 */
export function signRefreshJwt(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, refreshSecret, {
    expiresIn: REFRESH_TOKEN_TTL_MS / 1000,
  });
}
