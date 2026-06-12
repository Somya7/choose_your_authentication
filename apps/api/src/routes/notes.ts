import { Router } from "express";
import type { NotesResponse } from "@cyoa/shared";

export const notesRouter = Router();

// Placeholder routes — require auth once Project 1 is complete
notesRouter.get("/", (_req, res) => {
  const body: NotesResponse = { notes: [] };
  res.json(body);
});

notesRouter.post("/", (_req, res) => {
  res.status(501).json({
    error: "NOT_IMPLEMENTED",
    message: "Notes not implemented yet — coming in Project 1",
  });
});
