import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthMethodSelector } from "./AuthMethodSelector";
import { useAuth } from "../context/AuthContext";
import { useAuthMethod } from "../context/AuthMethodContext";

export function Layout() {
  const { user, loading, logout } = useAuth();
  const { methods, authMethod } = useAuthMethod();
  const navigate = useNavigate();

  const currentMethod = methods.find((m) => m.id === authMethod);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">
          <h1>Choose Your Authentication</h1>
          {currentMethod && (
            <span className="method-pill">{currentMethod.name}</span>
          )}
        </div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/notes">Notes</Link>
          {!loading && !user && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          {!loading && user && (
            <>
              <span className="user-badge">{user.email}</span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </header>

      <div className="method-bar">
        <AuthMethodSelector />
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
