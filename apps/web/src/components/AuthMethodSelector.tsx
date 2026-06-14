import type { AuthMethodId } from "@cyoa/shared";
import { useAuthMethod } from "../context/AuthMethodContext";
import { useAuth } from "../context/AuthContext";

export function AuthMethodSelector() {
  const { authMethod, setAuthMethod, methods } = useAuthMethod();
  const { user, logout } = useAuth();

  async function handleChange(next: AuthMethodId) {
    if (next === authMethod) return;

    // Log out current method before switching so sessions don't overlap
    if (user) {
      await logout();
    }
    setAuthMethod(next);
  }

  return (
    <div className="auth-method-selector">
      <label htmlFor="auth-method">Auth method</label>
      <select
        id="auth-method"
        value={authMethod}
        onChange={(e) => handleChange(e.target.value as AuthMethodId)}
      >
        {methods.map((m) => (
          <option key={m.id} value={m.id} disabled={m.status !== "available"}>
            {m.name}
            {m.status === "coming-soon" ? " (soon)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
