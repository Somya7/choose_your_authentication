import { FormEvent, useEffect, useState } from "react";
import type { Note } from "@cyoa/shared";
import { api } from "../lib/api";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadNotes() {
    setLoading(true);
    setError("");
    try {
      const data = await api.notes();
      setNotes(data.notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await api.createNote({ title, body });
      setNotes((current) => [data.note, ...current]);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="card">
        <h2>New note</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Add note"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Your notes</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && notes.length === 0 && (
          <p className="muted">No notes yet. Create one above.</p>
        )}

        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className="note-item">
              <strong>{note.title}</strong>
              {note.body && <p>{note.body}</p>}
              <time className="muted">
                {new Date(note.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
