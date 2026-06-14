import type { CreateNoteRequest, NotesResponse } from "@cyoa/shared";
import type { NextFunction, Request, Response, Router } from "express";
import { AppError } from "../../middleware/errorHandler.js";
import { createNote, listNotesByUser } from "../../repositories/notes.js";

/** Shared note handlers — same logic, different auth middleware per router. */
export function mountNotesRoutes(
  router: Router,
  requireAuth: (req: Request, res: Response, next: NextFunction) => void,
): void {
  router.use(requireAuth);

  router.get("/", (req, res) => {
    const notes = listNotesByUser(req.userId!);
    const body: NotesResponse = { notes };
    res.json(body);
  });

  router.post("/", (req, res, next) => {
    try {
      const { title, body: noteBody } = req.body as CreateNoteRequest;

      if (typeof title !== "string" || title.trim().length === 0) {
        throw new AppError(400, "INVALID_TITLE", "Title is required");
      }

      const note = createNote(
        req.userId!,
        title,
        typeof noteBody === "string" ? noteBody : "",
      );
      res.status(201).json({ note });
    } catch (err) {
      next(err);
    }
  });
}
