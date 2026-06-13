import { useEffect, useState } from "react";
import type { SessionInfoResponse } from "@cyoa/shared";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function SessionPage() {
  const { user } = useAuth();
  const [info, setInfo] = useState<SessionInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .session()
      .then(setInfo)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <p className="muted">Loading session details…</p>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="card">
        <p className="error">{error || "Could not load session info"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>Session cookies — Project 2</h2>
        <p className="muted">
          Logged in as <strong>{user?.email}</strong>. The browser holds only a
          session ID cookie; user data lives on the server.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Server session</h2>
          <dl className="detail-list">
            <div>
              <dt>Authenticated</dt>
              <dd className={info.authenticated ? "status-ok" : "error"}>
                {info.authenticated ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>{info.session.storage} (survives API restart)</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>
                {info.session.createdAt
                  ? new Date(info.session.createdAt).toLocaleString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Expires in</dt>
              <dd>{Math.round(info.session.expiresInMs / 86400000)} days</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2>Cookie attributes</h2>
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>
                <code>{info.cookie.name}</code>
              </dd>
            </div>
            <div>
              <dt>HttpOnly</dt>
              <dd>{info.cookie.httpOnly ? "Yes — JS cannot read it" : "No"}</dd>
            </div>
            <div>
              <dt>Secure</dt>
              <dd>
                {info.cookie.secure
                  ? "Yes — HTTPS only"
                  : "No — allowed on localhost HTTP"}
              </dd>
            </div>
            <div>
              <dt>SameSite</dt>
              <dd>
                <code>{info.cookie.sameSite}</code> — limits cross-site cookie
                sending
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="card">
        <h2>CSRF protection</h2>
        <p className="muted">
          Mutating requests (logout, create note) require a{" "}
          <code>{info.csrf.header}</code> header matching a token stored in the
          server session. Login/register are exempt — no session exists yet.
        </p>
        <dl className="detail-list">
          <div>
            <dt>CSRF enabled</dt>
            <dd>{info.csrf.enabled ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Token in session</dt>
            <dd>{info.csrf.tokenPresent ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2>Try it</h2>
        <ul className="muted">
          <li>
            Restart the API (<code>npm run dev:api</code>) — refresh this page.
            You should still be logged in (SQLite session store).
          </li>
          <li>
            Open DevTools → Application → Cookies → look for{" "}
            <code>{info.cookie.name}</code>
          </li>
          <li>
            Read the walkthrough in the repo:{" "}
            <code>docs/projects/02-session-cookies.md</code>
          </li>
        </ul>
      </div>
    </>
  );
}
