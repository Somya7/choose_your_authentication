import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app">
      <header className="header">
        <h1>Choose Your Authentication</h1>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/notes">Notes</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
