import type { Request } from "express";
import session from "express-session";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { db } from "../db/index.js";

const require = createRequire(import.meta.url);
const SqliteStore = require("better-sqlite3-session-store")(session);

export const SESSION_COOKIE_NAME = "connect.sid";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE_MS,
  };
}

export const sessionMiddleware = session({
  store: new SqliteStore({
    client: db,
    expired: {
      clear: true,
      intervalMs: 15 * 60 * 1000,
    },
  }),
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  name: SESSION_COOKIE_NAME,
  resave: false,
  saveUninitialized: false,
  cookie: sessionCookieOptions(),
});

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function assignUserSession(req: Request, userId: string): string {
  req.session.userId = userId;
  req.session.createdAt = new Date().toISOString();
  req.session.csrfToken = createCsrfToken();
  return req.session.csrfToken;
}

export function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function ensureCsrfToken(req: Request): string | undefined {
  if (!req.session.userId) {
    return undefined;
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = createCsrfToken();
  }
  return req.session.csrfToken;
}
