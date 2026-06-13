import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Choose Your Authentication</h1>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/session">Session</Link>
          {!loading && !user && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          {!loading && user && (
            <>
              <span className="user-badge">{user.email}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
