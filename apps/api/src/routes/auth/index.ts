import { Router } from "express";
import { jwtAuthRouter } from "./jwt.js";
import { sessionAuthRouter } from "./session.js";
import type { AuthMethodsResponse } from "@cyoa/shared";
import { AUTH_METHOD_CATALOG, getAvailableAuthMethods } from "@cyoa/shared";

/**
 * Auth router — each method lives under its own prefix so they coexist:
 *   /api/auth/session/*  — Project 2 session cookies
 *   /api/auth/jwt/*      — Project 3 JWT tokens
 *   /api/auth/methods    — list available methods for the UI picker
 */
export const authRouter = Router();

authRouter.get("/methods", (_req, res) => {
  const available = getAvailableAuthMethods();
  const body: AuthMethodsResponse = {
    methods: AUTH_METHOD_CATALOG,
    activeMethods: available.map((m) => m.id),
  };
  res.json(body);
});

authRouter.use("/session", sessionAuthRouter);
authRouter.use("/jwt", jwtAuthRouter);
