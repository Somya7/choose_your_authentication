import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/errorHandler.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

/** Shared email validation — used by every auth method that accepts passwords. */
export function validateEmail(email: unknown): string {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    throw new AppError(400, "INVALID_EMAIL", "A valid email is required");
  }
  return email.trim().toLowerCase();
}

/** Shared password validation — Project 1 bcrypt flow uses this. */
export function validatePassword(password: unknown): string {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      400,
      "INVALID_PASSWORD",
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
  return password;
}

/** Type-safe async route handler wrapper for Express 5 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
