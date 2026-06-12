import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function NotesPage() {
  const [notes, setNotes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    api
      .notes()
      .then((data) => setNotes(data.notes))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h2>Notes</h2>
      <p className="muted">
        Protected notes will appear here once authentication is implemented.
      </p>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && notes.length === 0 && (
        <p className="status-pending">No notes yet — login required (Project 1)</p>
      )}

      {notes.length > 0 && (
        <ul>
          {notes.map((note, index) => (
            <li key={index}>{JSON.stringify(note)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
