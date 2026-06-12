import { Router } from "express";
import type { HealthResponse } from "@cyoa/shared";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const body: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  res.json(body);
});
