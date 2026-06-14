import { Router } from "express";
import { validateSessionCsrf } from "../../middleware/sessionCsrf.js";
import { requireSessionAuth } from "../../middleware/requireSessionAuth.js";
import { mountNotesRoutes } from "./shared.js";

/** Notes protected by session cookie auth (Project 2) */
export const sessionNotesRouter = Router();
sessionNotesRouter.use(validateSessionCsrf);
mountNotesRoutes(sessionNotesRouter, requireSessionAuth);
