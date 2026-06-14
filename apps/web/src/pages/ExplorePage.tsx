import { useEffect, useState } from "react";
import type { JwtInfoResponse, SessionInfoResponse } from "@cyoa/shared";
import { AuthMethodSelector } from "../components/AuthMethodSelector";
import { useAuthMethod } from "../context/AuthMethodContext";
import { getJwtAccessToken } from "../lib/auth/jwtClient";
import { getSessionCsrfToken } from "../lib/auth/sessionClient";

export function ExplorePage() {
  const { authMethod, client } = useAuthMethod();
  const [info, setInfo] = useState<SessionInfoResponse | JwtInfoResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    client
      .getInfo()
      .then(setInfo)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [client, authMethod]);

  return (
    <>
      <div className="card">
        <h2>Explore auth method</h2>
        <p className="muted">
          Switch methods to compare how each one stores credentials and protects
          routes. Login state is independent per method.
        </p>
        <AuthMethodSelector />
      </div>

      {loading && (
        <div className="card">
          <p className="muted">Loading…</p>
        </div>
      )}

      {error && (
        <div className="card">
          <p className="error">{error}</p>
        </div>
      )}

      {info && info.authMethod === "session" && (
        <SessionInfoView info={info} csrfInMemory={getSessionCsrfToken()} />
      )}

      {info && info.authMethod === "jwt" && (
        <JwtInfoView info={info} accessInMemory={getJwtAccessToken()} />
      )}
    </>
  );
}

function SessionInfoView({
  info,
  csrfInMemory,
}: {
  info: SessionInfoResponse;
  csrfInMemory: string | null;
}) {
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Session (Project 2)</h2>
        <dl className="detail-list">
          <div>
            <dt>Authenticated</dt>
            <dd className={info.authenticated ? "status-ok" : "error"}>
              {info.authenticated ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt>Server storage</dt>
            <dd>{info.session.storage}</dd>
          </div>
          <div>
            <dt>Cookie</dt>
            <dd>
              <code>{info.cookie.name}</code> (HttpOnly)
            </dd>
          </div>
          <div>
            <dt>SameSite</dt>
            <dd>
              <code>{info.cookie.sameSite}</code>
            </dd>
          </div>
        </dl>
      </div>
      <div className="card">
        <h2>CSRF (session only)</h2>
        <dl className="detail-list">
          <div>
            <dt>Header</dt>
            <dd>
              <code>{info.csrf.header}</code>
            </dd>
          </div>
          <div>
            <dt>Token in session</dt>
            <dd>{info.csrf.tokenPresent ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Token in JS memory</dt>
            <dd>{csrfInMemory ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function JwtInfoView({
  info,
  accessInMemory,
}: {
  info: JwtInfoResponse;
  accessInMemory: string | null;
}) {
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Access token (Project 3)</h2>
        <dl className="detail-list">
          <div>
            <dt>Storage</dt>
            <dd>{info.accessToken.storage}</dd>
          </div>
          <div>
            <dt>In memory now</dt>
            <dd>{accessInMemory ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Sent via</dt>
            <dd>
              <code>Authorization: Bearer</code>
            </dd>
          </div>
          <div>
            <dt>Expires</dt>
            <dd>
              {info.accessToken.expiresAt
                ? new Date(info.accessToken.expiresAt).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
      <div className="card">
        <h2>Refresh token</h2>
        <dl className="detail-list">
          <div>
            <dt>Storage</dt>
            <dd>{info.refreshToken.storage}</dd>
          </div>
          <div>
            <dt>Cookie</dt>
            <dd>
              <code>{info.refreshToken.cookieName}</code>
            </dd>
          </div>
          <div>
            <dt>Cookie present</dt>
            <dd>{info.refreshToken.present ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Server copy</dt>
            <dd>Hashed in SQLite (revocable)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
