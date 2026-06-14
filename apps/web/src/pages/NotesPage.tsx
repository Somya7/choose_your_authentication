import { FormEvent, useEffect, useState } from "react";
import type { Note } from "@cyoa/shared";
import { useAuthMethod } from "../context/AuthMethodContext";

export function NotesPage() {
  const { client } = useAuthMethod();
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
      setNotes(await client.getNotes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [client]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const note = await client.createNote({ title, body });
      setNotes((current) => [note, ...current]);
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
        <p className="muted">
          Notes are scoped to the active auth method — session and JWT maintain
          separate login states.
        </p>
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
