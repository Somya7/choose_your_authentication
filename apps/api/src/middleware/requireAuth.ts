import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId) {
    next(new AppError(401, "UNAUTHORIZED", "Login required"));
    return;
  }
  next();
}
