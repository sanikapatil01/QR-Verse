import { useAuth } from "../../context/AuthContext.jsx";

function Settings() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Settings</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
        Account + developer API key.
      </p>

      <div className="mt-6 grid gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">Email</div>
          <div className="font-medium mt-1">{user?.email || "—"}</div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">Public API Key</div>
          <div className="mt-1 font-mono text-sm break-all">{user?.apiKey || "—"}</div>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Use with `POST /api/qr/public/generate` (MVP currently returns QR but does not store history).
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

