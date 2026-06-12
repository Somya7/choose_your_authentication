import type { NextFunction, Request, Response } from "express";
import type { ApiError } from "@cyoa/shared";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiError = { error: err.code, message: err.message };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error(err);
  const body: ApiError = {
    error: "INTERNAL_ERROR",
    message: "Something went wrong",
  };
  res.status(500).json(body);
}
