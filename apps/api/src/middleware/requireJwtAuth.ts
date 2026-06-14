import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "./errorHandler.js";

/**
 * Project 3 — requires Authorization: Bearer <accessToken>.
 * The token is verified statelessly (signature check, no DB lookup).
 */
export function requireJwtAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Missing or invalid access token"));
    return;
  }

  const userId = verifyAccessToken(header.slice("Bearer ".length));

  if (!userId) {
    next(
      new AppError(
        401,
        "TOKEN_EXPIRED",
        "Access token invalid or expired — refresh or log in again",
      ),
    );
    return;
  }

  req.userId = userId;
  next();
}
