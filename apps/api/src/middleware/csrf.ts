import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const CSRF_EXEMPT_PATHS = new Set([
  "/api/auth/register",
  "/api/auth/login",
]);

export function validateCsrf(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!MUTATING_METHODS.has(req.method)) {
    next();
    return;
  }

  // authRouter is mounted at /api/auth — req.path is relative to mount
  if (CSRF_EXEMPT_PATHS.has(req.path)) {
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
        "Invalid or missing CSRF token — fetch a fresh token after login",
      ),
    );
    return;
  }

  next();
}
