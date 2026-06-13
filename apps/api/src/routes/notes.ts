import type { CreateNoteRequest, NotesResponse } from "@cyoa/shared";
import { Router } from "express";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createNote, listNotesByUser } from "../repositories/notes.js";

export const notesRouter = Router();

notesRouter.use(requireAuth);

notesRouter.get("/", (req, res) => {
  const notes = listNotesByUser(req.session.userId!);
  const body: NotesResponse = { notes };
  res.json(body);
});

notesRouter.post("/", (req, res, next) => {
  try {
    const { title, body: noteBody } = req.body as CreateNoteRequest;

    if (typeof title !== "string" || title.trim().length === 0) {
      throw new AppError(400, "INVALID_TITLE", "Title is required");
    }

    const note = createNote(
      req.session.userId!,
      title,
      typeof noteBody === "string" ? noteBody : "",
    );

    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
});
