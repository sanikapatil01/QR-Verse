import { useEffect, useMemo, useState } from "react";
import { qrHistory, qrUpdateDestination } from "../../services/api";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [draftDestination, setDraftDestination] = useState({});

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await qrHistory(80);
      setItems(res.data.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isEmpty = useMemo(() => !loading && items.length === 0, [loading, items.length]);

  const saveDestination = async (qr) => {
    const next = draftDestination[qr._id] ?? qr.destinationUrl ?? "";
    try {
      setSavingId(qr._id);
      await qrUpdateDestination(qr._id, next);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to update destination");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">QR History</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
            Your generated QRs (latest first).
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
      {isEmpty && (
        <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">
          No QRs yet. Generate one from the Generate page.
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((qr) => (
          <div
            key={qr._id}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <span className="uppercase text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    {qr.type}
                  </span>
                  {qr.isDynamic && (
                    <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900">
                      Dynamic
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  {formatDate(qr.createdAt)}
                </div>
              </div>
            
            </div>

            {qr.previewDataUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={qr.previewDataUrl}
                  alt="QR"
                  className="w-48 h-48 object-contain rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white"
                />
              </div>
            )}

            <div className="mt-4">
              <div className="text-xs text-zinc-600 dark:text-zinc-300">Content</div>
              <div className="text-xs break-all text-zinc-700 dark:text-zinc-200 mt-1">
                {qr.content}
              </div>
            </div>

            {qr.isDynamic && (
              <div className="mt-4 grid gap-2">
                <div className="text-xs text-zinc-600 dark:text-zinc-300">Destination</div>
                <input
                  value={draftDestination[qr._id] ?? qr.destinationUrl ?? ""}
                  onChange={(e) =>
                    setDraftDestination((d) => ({ ...d, [qr._id]: e.target.value }))
                  }
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => saveDestination(qr)}
                  disabled={savingId === qr._id}
                  className="px-3 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm disabled:opacity-60"
                >
                  {savingId === qr._id ? "Saving..." : "Update Destination"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;

