/**
 * Project 2 — CSRF protection for session-cookie auth only.
 * JWT Bearer tokens are not auto-sent by browsers, so they don't need CSRF.
 */
import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Paths exempt from CSRF — no session exists yet at login/register time. */
const EXEMPT = new Set(["/register", "/login"]);

export function validateSessionCsrf(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!MUTATING.has(req.method) || EXEMPT.has(req.path)) {
    next();
    return;
  }

  if (!req.session.userId) {
    next();
    return;
  }

  const headerToken = req.headers["x-csrf-token"];
  const token = typeof headerToken === "string" ? headerToken : undefined;

  if (!token || token !== req.session.csrfToken) {
    next(
      new AppError(
        403,
        "CSRF_INVALID",
        "Invalid or missing CSRF token",
      ),
    );
    return;
  }

  next();
}
