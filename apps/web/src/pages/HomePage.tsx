import { useEffect, useState } from "react";
import { api } from "../lib/api";

const LEARNING_PATH = [
  { step: 1, name: "Username + password", status: "done" as const },
  { step: 2, name: "Session cookies", status: "done" as const },
  { step: 3, name: "JWT access + refresh", status: "next" as const },
  { step: 4, name: "OAuth 2.0 / OIDC", status: "planned" },
  { step: 5, name: "Magic link / OTP", status: "planned" },
  { step: 6, name: "WebAuthn / Passkeys", status: "planned" },
  { step: 7, name: "RBAC authorization", status: "planned" },
  { step: 8, name: "API keys", status: "planned" },
] as const;

export function HomePage() {
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">(
    "loading",
  );
  const [timestamp, setTimestamp] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    api
      .health()
      .then((data) => {
        setApiStatus("ok");
        setTimestamp(data.timestamp);
      })
      .catch((err: Error) => {
        setApiStatus("error");
        setError(err.message);
      });
  }, []);

  return (
    <>
      <div className="card">
        <h2>Welcome</h2>
        <p className="muted">
          A monorepo for learning authentication by building. Each project
          implements a different auth method on the same Notes app.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>API status</h2>
          {apiStatus === "loading" && <p className="muted">Checking…</p>}
          {apiStatus === "ok" && (
            <>
              <p className="status-ok">Connected</p>
              <p className="muted">
                Last health check: <code>{timestamp}</code>
              </p>
            </>
          )}
          {apiStatus === "error" && (
            <p className="error">
              Could not reach API — run <code>npm run dev</code>. {error}
            </p>
          )}
        </div>

        <div className="card">
          <h2>Stack</h2>
          <ul className="muted">
            <li>Express API on port 3001</li>
            <li>React + Vite on port 5173</li>
            <li>Shared TypeScript types in <code>@cyoa/shared</code></li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2>Learning path</h2>
        <ul className="learning-path">
          {LEARNING_PATH.map((item) => (
            <li key={item.step}>
              <span>{item.step}.</span>
              <span>{item.name}</span>
              <span className={`badge${item.status === "done" ? " done" : ""}`}>
                {item.status === "done"
                  ? "Complete"
                  : item.status === "next"
                    ? "Up next"
                    : "Planned"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
