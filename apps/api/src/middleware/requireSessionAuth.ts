import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";

/** Project 2 — requires a valid server-side session (connect.sid cookie). */
export function requireSessionAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId) {
    next(new AppError(401, "UNAUTHORIZED", "Session login required"));
    return;
  }
  req.userId = req.session.userId;
  next();
}
