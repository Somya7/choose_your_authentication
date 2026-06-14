import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthMethodSelector } from "../components/AuthMethodSelector";
import { useAuthMethod } from "../context/AuthMethodContext";

export function HomePage() {
  const { methods, authMethod } = useAuthMethod();
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">(
    "loading",
  );
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: { timestamp: string }) => {
        setApiStatus("ok");
        setTimestamp(data.timestamp);
      })
      .catch(() => setApiStatus("error"));
  }, []);

  const available = methods.filter((m) => m.status === "available");
  const comingSoon = methods.filter((m) => m.status === "coming-soon");

  return (
    <>
      <div className="card hero-card">
        <h2>Authentication playground</h2>
        <p className="muted">
          Pick an auth method, log in, and compare how each one establishes
          identity. All methods share the same Notes app but run independently.
        </p>
        <AuthMethodSelector />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>API status</h2>
          {apiStatus === "loading" && <p className="muted">Checking…</p>}
          {apiStatus === "ok" && (
            <>
              <p className="status-ok">Connected</p>
              <p className="muted">
                Last check: <code>{timestamp}</code>
              </p>
            </>
          )}
          {apiStatus === "error" && (
            <p className="error">Could not reach API — run npm run dev</p>
          )}
        </div>

        <div className="card">
          <h2>Active method</h2>
          <p className="status-ok">
            {methods.find((m) => m.id === authMethod)?.name}
          </p>
          <p className="muted">
            Use the dropdown to switch. Each method has its own login session.
          </p>
          <Link to="/explore">Explore how it works →</Link>
        </div>
      </div>

      <div className="card">
        <h2>Available now</h2>
        <ul className="method-list">
          {available.map((m) => (
            <li key={m.id} className={m.id === authMethod ? "active" : ""}>
              <div>
                <strong>{m.name}</strong>
                <p className="muted">{m.description}</p>
              </div>
              {m.id === authMethod && (
                <span className="badge done">Selected</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Coming soon</h2>
        <ul className="method-list">
          {comingSoon.map((m) => (
            <li key={m.id}>
              <div>
                <strong>{m.name}</strong>
                <p className="muted">{m.description}</p>
              </div>
              <span className="badge">Planned</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
