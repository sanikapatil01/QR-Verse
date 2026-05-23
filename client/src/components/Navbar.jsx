import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const isBrowser = typeof window !== "undefined";
  const [theme, setTheme] = useState(() => {
    if (!isBrowser) return "light";
    const stored = localStorage.getItem("qrverse_theme");
    if (stored) return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (!isBrowser) return;
    const apply = (t) => {
      const isDark = t === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("qrverse_theme", t);
    };

    apply(theme);

    // respond to system changes unless user has explicit preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      const stored = localStorage.getItem("qrverse_theme");
      if (stored) return; // user pref wins
      apply(e.matches ? "dark" : "light");
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme, isBrowser]);

  return (
    <button
      aria-pressed={theme === "dark"}
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
};

function Navbar() {
  const { isAuthed, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm ${
      isActive
        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
    }`;

  return (
    <div className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="font-bold text-lg text-zinc-900 dark:text-white">
          QRVerse
        </Link>

        <div className="flex items-center gap-2">
          <NavLink to="/generate" className={linkClass}>
            Generate
          </NavLink>
          <NavLink to="/template" className={linkClass}>
            Templates
          </NavLink>
          <NavLink to="/pricing" className={linkClass}>
            Pricing
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
          {isAuthed && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isAuthed ? (
            <>
              <Link
                to="/login"
                className="px-3 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-3 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
