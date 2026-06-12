import { Router } from "express";
import type { MeResponse } from "@cyoa/shared";

export const authRouter = Router();

// Placeholder routes — implemented in Project 1 (password auth)
authRouter.post("/register", (_req, res) => {
  res.status(501).json({
    error: "NOT_IMPLEMENTED",
    message: "Auth not implemented yet — coming in Project 1",
  });
});

authRouter.post("/login", (_req, res) => {
  res.status(501).json({
    error: "NOT_IMPLEMENTED",
    message: "Auth not implemented yet — coming in Project 1",
  });
});

authRouter.post("/logout", (_req, res) => {
  res.status(501).json({
    error: "NOT_IMPLEMENTED",
    message: "Auth not implemented yet — coming in Project 1",
  });
});

authRouter.get("/me", (_req, res) => {
  const body: MeResponse = { user: null };
  res.json(body);
});
