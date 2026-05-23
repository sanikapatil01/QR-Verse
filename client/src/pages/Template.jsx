import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { qrPublicGenerate } from "../services/api";

const templates = [
  {
    id: "classic",
    title: "Classic",
    description: "Clean black-on-white QR.",
    style: { width: 320, margin: 2, errorCorrectionLevel: "M", darkColor: "#111827", lightColor: "#ffffff" }
  },
  {
    id: "bold",
    title: "Bold",
    description: "Thicker modules and strong dark color.",
    style: { width: 320, margin: 1, errorCorrectionLevel: "H", darkColor: "#0f172a", lightColor: "#f8fafc" }
  },
  {
    id: "minimal",
    title: "Minimal",
    description: "Light design with extra white space.",
    style: { width: 320, margin: 4, errorCorrectionLevel: "M", darkColor: "#111827", lightColor: "#ffffff" }
  },
  {
    id: "inverted",
    title: "Inverted",
    description: "White-on-dark styling.",
    style: { width: 320, margin: 2, errorCorrectionLevel: "H", darkColor: "#f8fafc", lightColor: "#111827" }
  }
];

function Template() {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const svgLogoDataUrl = (text = "Q") => {
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'><rect width='100%' height='100%' rx='90' fill='#ffffff'/><text x='50%' y='54%' font-size='260' text-anchor='middle' fill='#111827' font-family='Arial, Helvetica, sans-serif' dominant-baseline='middle'>${text}</text></svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    const overlayLogo = async (qrDataUrl, logoDataUrl) => {
      return new Promise((resolve) => {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          const size = Math.max(qrImg.width, qrImg.height);
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");

          // draw QR into canvas
          ctx.drawImage(qrImg, 0, 0, size, size);

          // draw white rounded background for logo
          const logoSize = Math.floor(size * 0.22);
          const logoX = Math.floor((size - logoSize) / 2);
          const logoY = Math.floor((size - logoSize) / 2);

          ctx.fillStyle = "#ffffff";
          const r = Math.floor(logoSize * 0.18);
          ctx.beginPath();
          ctx.moveTo(logoX + r, logoY);
          ctx.arcTo(logoX + logoSize, logoY, logoX + logoSize, logoY + logoSize, r);
          ctx.arcTo(logoX + logoSize, logoY + logoSize, logoX, logoY + logoSize, r);
          ctx.arcTo(logoX, logoY + logoSize, logoX, logoY, r);
          ctx.arcTo(logoX, logoY, logoX + logoSize, logoY, r);
          ctx.closePath();
          ctx.fill();

          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            ctx.drawImage(logoImg, logoX + Math.floor(logoSize * 0.1), logoY + Math.floor(logoSize * 0.1), Math.floor(logoSize * 0.8), Math.floor(logoSize * 0.8));
            resolve(canvas.toDataURL("image/png"));
          };
          logoImg.onerror = () => resolve(qrDataUrl);
          logoImg.src = logoDataUrl;
        };
        qrImg.onerror = () => resolve(qrDataUrl);
        qrImg.src = qrDataUrl;
      });
    };

    const buildPreviews = async () => {
      try {
        setLoading(true);
        const next = {};
        await Promise.all(
          templates.map(async (t) => {
            try {
              const res = await qrPublicGenerate({ type: "url", payload: { url: "https://example.com" }, style: t.style, dynamic: false });
              const base = res.data?.qrImage || "";
              // overlay placeholder logo (first letter of template id uppercase)
              const logo = svgLogoDataUrl(t.title?.[0] || "Q");
              const withLogo = base ? await overlayLogo(base, logo) : "";
              next[t.id] = withLogo;
            } catch (e) {
              next[t.id] = "";
            }
          })
        );
        if (mounted) setPreviews(next);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    buildPreviews();
    return () => (mounted = false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">QR Templates</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-300 text-sm">Choose a design template and generate your QR with that style preset.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <div key={template.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">{template.title}</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{template.description}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center h-40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              {previews[template.id] ? (
                <img src={previews[template.id]} alt={`${template.title} preview`} className="max-h-full max-w-full" />
              ) : (
                <div className="text-sm text-zinc-500">{loading ? "Generating preview..." : "Preview unavailable"}</div>
              )}
            </div>

            <button
              onClick={() => navigate(`/generate?template=${template.id}`)}
              className="mt-5 w-full px-4 py-3 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm"
            >
              Use {template.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Template;
