import { useEffect, useState } from "react";
import { qrAnalytics } from "../../services/api";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await qrAnalytics();
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byType = data?.byType || {};
  // coerce counts to numbers to avoid string-sorting/width issues
  const typeEntries = Object.entries(byType)
    .map(([t, c]) => [t, Number(c) || 0])
    .sort((a, b) => b[1] - a[1]);
  const maxTypeCount = Math.max(1, ...typeEntries.map(([, c]) => Number(c) || 0));

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Analytics</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
            Generated QRs, most-used types and recent activity.
          </p>
        </div>
        <button
          onClick={load}
          className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {loading && <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">Loading…</div>}

      {!loading && data && (
        <>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="text-sm text-zinc-600 dark:text-zinc-300">Total Generated</div>
              <div className="mt-2 text-3xl font-extrabold">{data.totalGenerated ?? 0}</div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="text-sm text-zinc-600 dark:text-zinc-300">Most Used Type</div>
              <div className="mt-2 text-3xl font-extrabold">{data.mostUsedType ?? "—"}</div>
            </div>
          </div>

          <div className="mt-6 grid lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="font-semibold">QR Types (by count)</div>
              <div className="mt-3 space-y-3">
                {typeEntries.length === 0 && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">No data yet.</div>
                )}
                {typeEntries.map(([t, c]) => (
                  <div key={t} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="uppercase text-zinc-700 dark:text-zinc-200">{t}</div>
                      <div className="font-medium">{c}</div>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded h-3">
                      <div
                        className="h-3 rounded bg-emerald-600"
                        style={{ width: `${(c / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="font-semibold">Recent Activity</div>
              <div className="mt-3 grid gap-2">
                {(data.recent || []).length === 0 && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">No recent activity.</div>
                )}
                {(data.recent || []).map((r) => (
                  <div key={r._id} className="text-sm flex items-center justify-between gap-3">
                    <div className="uppercase">{r.type}</div>
                    <div className="text-zinc-600 dark:text-zinc-300">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;

