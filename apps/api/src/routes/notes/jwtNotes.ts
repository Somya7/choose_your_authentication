import { Router } from "express";
import { requireJwtAuth } from "../../middleware/requireJwtAuth.js";
import { mountNotesRoutes } from "./shared.js";

/** Notes protected by JWT Bearer token (Project 3) */
export const jwtNotesRouter = Router();
mountNotesRoutes(jwtNotesRouter, requireJwtAuth);
