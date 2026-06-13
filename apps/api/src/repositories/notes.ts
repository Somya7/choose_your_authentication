import type { Note } from "@cyoa/shared";
import { db } from "../db/index.js";

interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listNotesByUser(userId: string): Note[] {
  const rows = db
    .prepare(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
    )
    .all(userId) as NoteRow[];
  return rows.map(toNote);
}

export function createNote(
  userId: string,
  title: string,
  body: string,
): Note {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    "INSERT INTO notes (id, user_id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(id, userId, title.trim(), body.trim(), now, now);

  return {
    id,
    userId,
    title: title.trim(),
    body: body.trim(),
    createdAt: now,
    updatedAt: now,
  };
}
