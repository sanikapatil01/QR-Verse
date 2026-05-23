import { NavLink, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import History from "./dashboard/History.jsx";
import Analytics from "./dashboard/Analytics.jsx";
import Settings from "./dashboard/Settings.jsx";
import contactInfo from "../data/contactInfo";

function Dashboard() {
  const { user } = useAuth();

  const tabClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm ${
      isActive
        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
    }`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Signed in as <span className="font-medium">{user?.email}</span>
          </p>
        </div>
        <a
          href="/generate"
          className="px-4 py-3 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium"
        >
          Generate New QR
        </a>
      </div>

      <div className="mt-6 flex gap-2 flex-wrap">
        <NavLink to="/dashboard/history" className={tabClass}>
          History
        </NavLink>
        <NavLink to="/dashboard/analytics" className={tabClass}>
          Analytics
        </NavLink>
        <NavLink to="/dashboard/settings" className={tabClass}>
          Settings
        </NavLink>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <Routes>
            <Route path="/" element={<History />} />
            <Route path="history" element={<History />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>

        <aside className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="text-sm text-zinc-500">Plan</div>
          <div className="font-semibold mt-1">Free — All Features</div>
          <div className="mt-2 text-sm text-zinc-600">All Free/Pro/Business features </div>
          <Link to="/pricing" className="text-sm text-sky-600 mt-3 block">View pricing</Link>

          <div className="mt-4 border-t pt-4">
            <div className="text-sm text-zinc-500">Contact</div>
            <div className="font-medium mt-1">{contactInfo.name}</div>
            <a className="block text-sky-600 text-sm mt-1" href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            <div className="text-xs text-zinc-500 mt-2">{contactInfo.responseTime} · {contactInfo.availability}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
