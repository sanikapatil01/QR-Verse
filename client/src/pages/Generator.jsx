import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { qrGenerate, qrPublicGenerate, qrRenderSvg } from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const normalizeUrl = (rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;
  const isLocal = /^(localhost|127(?:\.\d+){0,2}\.\d+|10(?:\.\d+){0,2}\.\d+|172\.(1[6-9]|2\d|3[0-1])(?:\.\d+){0,2}\.\d+|192\.168(?:\.\d+){0,2}\.\d+)(:\d+)?(\/.*)?$/i;
  return isLocal.test(url) ? `http://${url}` : `https://${url}`;
};

const isValidUrlInput = (rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return true;
  return /^(localhost|127(?:\.\d+){0,2}\.\d+|10(?:\.\d+){0,2}\.\d+|172\.(1[6-9]|2\d|3[0-1])(?:\.\d+){0,2}\.\d+|192\.168(?:\.\d+){0,2}\.\d+|[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+)(:\d+)?(\/.*)?$/i.test(url);
};

const typeDefaults = {
  url: { url: "https://example.com" },
  text: { text: "Hello from QRVerse" },
  wifi: { ssid: "MyWiFi", password: "password123", security: "WPA", hidden: false },
  email: { to: "hello@example.com", subject: "Hello", body: "Message from QRVerse" },
  phone: { phone: "+911234567890" },
  whatsapp: { phone: "911234567890", text: "Hi!" },
  upi: { pa: "yourupi@bank", pn: "Your Name", am: "1", tn: "Payment", cu: "INR" }
};

const templates = {
  classic: { width: 320, margin: 2, errorCorrectionLevel: "M", darkColor: "#111827", lightColor: "#ffffff" },
  bold: { width: 320, margin: 1, errorCorrectionLevel: "H", darkColor: "#0f172a", lightColor: "#f8fafc" },
  minimal: { width: 320, margin: 4, errorCorrectionLevel: "M", darkColor: "#111827", lightColor: "#ffffff" },
  inverted: { width: 320, margin: 2, errorCorrectionLevel: "H", darkColor: "#f8fafc", lightColor: "#111827" }
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Color and contrast helpers
const hexToRgb = (hex) => {
  const h = hex.replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const luminance = (hex) => {
  try {
    const [r, g, b] = hexToRgb(hex);
    const srgb = [r, g, b].map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  } catch {
    return 0;
  }
};

const ensureContrastOrder = (darkColor, lightColor) => {
  const ld = luminance(darkColor || "#000000");
  const ll = luminance(lightColor || "#ffffff");
  if (ld > ll) return [lightColor, darkColor];
  return [darkColor, lightColor];
};

// Logo overlay
const overlayLogoOnQr = async ({ qrDataUrl, logoDataUrl, lightColor = "#ffffff" }) => {
  if (!qrDataUrl || !logoDataUrl) return qrDataUrl;

  return new Promise((resolve) => {
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      const size = Math.max(qrImg.width, qrImg.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(qrImg, 0, 0, size, size);

      const logoSize = Math.floor(size * 0.22);
      const logoX = Math.floor((size - logoSize) / 2);
      const logoY = Math.floor((size - logoSize) / 2);

      ctx.fillStyle = lightColor || "#ffffff";
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
        ctx.drawImage(
          logoImg,
          logoX + Math.floor(logoSize * 0.1),
          logoY + Math.floor(logoSize * 0.1),
          Math.floor(logoSize * 0.8),
          Math.floor(logoSize * 0.8)
        );
        resolve(canvas.toDataURL("image/png"));
      };
      logoImg.onerror = () => resolve(qrDataUrl);
      logoImg.src = logoDataUrl;
    };
    qrImg.onerror = () => resolve(qrDataUrl);
    qrImg.src = qrDataUrl;
  });
};

function Generator() {
  const { isAuthed } = useAuth();
  const location = useLocation();

  const [type, setType] = useState("url");
  const [payload, setPayload] = useState(typeDefaults.url);
  const [style, setStyle] = useState(() => {
    const fallback = {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      darkColor: "#111827",
      lightColor: "#ffffff"
    };

    const params = new URLSearchParams(location.search);
    const templateKey = params.get("template");
    return templateKey && templates[templateKey] ? { ...templates[templateKey] } : fallback;
  });

  const [dynamic, setDynamic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrBaseImage, setQrBaseImage] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [lastContent, setLastContent] = useState("");
  const [lastQrId, setLastQrId] = useState("");
  const [error, setError] = useState("");

  const logoInputRef = useRef(null);
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoFilename, setLogoFilename] = useState("");

  useEffect(() => {
    let cancelled = false;

    const apply = async () => {
      if (!qrBaseImage) {
        if (!cancelled) setQrImage("");
        return;
      }
      if (!logoDataUrl) {
        if (!cancelled) setQrImage(qrBaseImage);
        return;
      }

      const next = await overlayLogoOnQr({
        qrDataUrl: qrBaseImage,
        logoDataUrl,
        lightColor: style.lightColor || "#ffffff"
      });
      if (!cancelled) setQrImage(next);
    };

    apply();
    return () => {
      cancelled = true;
    };
  }, [qrBaseImage, logoDataUrl, style.lightColor]);

  const fields = useMemo(() => {
    if (type === "url") return [{ k: "url", label: "URL" }];
    if (type === "text") return [{ k: "text", label: "Text" }];
    if (type === "wifi")
      return [
        { k: "ssid", label: "WiFi SSID" },
        { k: "password", label: "WiFi Password" },
        { k: "security", label: "Security (WPA/WEP/nopass)" }
      ];
    if (type === "email")
      return [
        { k: "to", label: "To" },
        { k: "subject", label: "Subject" },
        { k: "body", label: "Body" }
      ];
    if (type === "phone") return [{ k: "phone", label: "Phone (tel:)" }];
    if (type === "whatsapp")
      return [
        { k: "phone", label: "WhatsApp phone (digits)" },
        { k: "text", label: "Message" }
      ];
    if (type === "upi")
      return [
        { k: "pa", label: "UPI ID (pa)" },
        { k: "pn", label: "Payee name (pn)" },
        { k: "am", label: "Amount (am)" },
        { k: "tn", label: "Note (tn)" },
        { k: "cu", label: "Currency (cu)" }
      ];
    return [{ k: "text", label: "Text" }];
  }, [type]);

  const onChangeType = (t) => {
    setType(t);
    setPayload(typeDefaults[t] || { text: "" });
    setError("");
  };

  const setPayloadField = (k, v) => setPayload((p) => ({ ...p, [k]: v }));
  const setStyleField = (k, v) => setStyle((s) => ({ ...s, [k]: v }));

  const onPickLogo = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setError("Please select an image file for the logo.");
      return;
    }

    // For best scan reliability with a centered logo, use high error correction.
    setStyle((s) => ({ ...s, errorCorrectionLevel: "H" }));

    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoDataUrl(dataUrl);
      setLogoFilename(file.name || "logo");
    } catch {
      setError("Failed to read logo file.");
    }
  };

  const clearLogo = () => {
    setLogoDataUrl("");
    setLogoFilename("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const generate = async () => {
    try {
      setError("");
      setLoading(true);
      setLastQrId("");

      if (type === "url" && !isValidUrlInput(payload.url)) {
        throw new Error("Enter a valid full URL, hostname, or localhost address.");
      }

      // Prepare effective style for generation to maximize scannability
      const effectiveStyle = { ...style };
      if (logoDataUrl) effectiveStyle.errorCorrectionLevel = "H";
      // Ensure dark/light colors are in the right order (dark < light luminance)
      const [d, l] = ensureContrastOrder(effectiveStyle.darkColor, effectiveStyle.lightColor);
      effectiveStyle.darkColor = d;
      effectiveStyle.lightColor = l;

      const body = {
        type,
        payload: type === "url" ? { ...payload, url: normalizeUrl(payload.url) } : payload,
        style: effectiveStyle,
        dynamic: isAuthed ? dynamic : false
      };
      const res = isAuthed ? await qrGenerate(body) : await qrPublicGenerate(body);

      const serverQrImage = res.data.qrImage;
      const content = res.data?.qr?.content || res.data?.content || "";

      setQrBaseImage(serverQrImage);

      const withLogo = await overlayLogoOnQr({
        qrDataUrl: serverQrImage,
        logoDataUrl,
        lightColor: effectiveStyle.lightColor || "#ffffff"
      });

      setQrImage(withLogo);
      setLastContent(content);
      setLastQrId(res.data?.qr?._id || "");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const downloadPng = async () => {
    if (!qrImage) return;
    const blob = await dataUrlToBlob(qrImage);
    downloadBlob(blob, "qrverse.png");
  };

  const downloadJpg = async () => {
    if (!qrImage) return;
    const img = new Image();
    img.src = qrImage;
    await new Promise((r, rej) => {
      img.onload = r;
      img.onerror = rej;
    });
    const canvas = document.createElement("canvas");
    const size = Number(style.width) || 320;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = style.lightColor || "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    const jpgUrl = canvas.toDataURL("image/jpeg", 0.92);
    const blob = await dataUrlToBlob(jpgUrl);
    downloadBlob(blob, "qrverse.jpg");
  };

  const downloadSvg = async () => {
    if (!lastContent) return;
    const res = await qrRenderSvg(lastContent, style);
    const svg = res.data.svg;
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "qrverse.svg");
  };

  const printPdf = async () => {
    if (!qrImage) return;

    const printWindow = window.open("", "_blank", "width=700,height=900");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>QRVerse QR Print</title>
          <style>
            body { margin: 0; padding: 32px; min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #fff; }
            .card { display: flex; flex-direction: column; align-items: center; gap: 18px; font-family: system-ui, sans-serif; color: #111; }
            img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 16px; }
            .meta { max-width: 520px; text-align: center; font-size: 14px; line-height: 1.5; color: #333; }
            @media print { body { padding: 18px; } .card { gap: 12px; } }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="${qrImage}" alt="QR Code" />
            <div class="meta">QR content: ${lastContent || "—"}</div>
          </div>
          <script>
            window.onload = function() { window.print(); };
            window.onafterprint = function() { window.close(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const canDynamic = isAuthed;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">QR Generator</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-300 text-sm">
            Static QRs work without login. Login unlocks history + Dynamic QR.
          </p>
        </div>
        {error && (
          <div className="px-4 py-2 rounded border border-red-200 bg-red-50 text-red-700 text-sm dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">QR Type</span>
                <select
                  value={type}
                  onChange={(e) => onChangeType(e.target.value)}
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
                >
                  <option value="url">URL</option>
                  <option value="text">Text</option>
                  <option value="wifi">WiFi</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="upi">UPI Payment</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">Size</span>
                <select
                  value={style.width}
                  onChange={(e) => setStyleField("width", Number(e.target.value))}
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
                >
                  {[240, 280, 320, 360, 420, 520].map((n) => (
                    <option key={n} value={n}>
                      {n}px
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3">
              {fields.map((f) => (
                <label key={f.k} className="grid gap-1 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-300">{f.label}</span>
                  <input
                    value={payload?.[f.k] ?? ""}
                    onChange={(e) => setPayloadField(f.k, e.target.value)}
                    className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
                  />
                </label>
              ))}
              {type === "wifi" && (
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={Boolean(payload.hidden)}
                    onChange={(e) => setPayloadField("hidden", e.target.checked)}
                  />
                  Hidden network
                </label>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">QR Color</span>
                <input
                  type="color"
                  value={style.darkColor}
                  onChange={(e) => setStyleField("darkColor", e.target.value)}
                  className="h-10 w-full rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">Background</span>
                <input
                  type="color"
                  value={style.lightColor}
                  onChange={(e) => setStyleField("lightColor", e.target.value)}
                  className="h-10 w-full rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">Margin</span>
                <select
                  value={style.margin}
                  onChange={(e) => setStyleField("margin", Number(e.target.value))}
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">Error Correction</span>
                <select
                  value={style.errorCorrectionLevel}
                  onChange={(e) => setStyleField("errorCorrectionLevel", e.target.value)}
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded px-3 py-2"
                >
                  {["L", "M", "Q", "H"].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 items-end">
              <div className="grid gap-2">
                <div className="text-sm text-zinc-600 dark:text-zinc-300">Logo (optional)</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickLogo(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm"
                  >
                    {logoDataUrl ? "Change Logo" : "Add Logo"}
                  </button>
                  {logoDataUrl && (
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {logoDataUrl
                    ? `Selected: ${logoFilename || "logo"}. Error correction is set to H for reliability.`
                    : "Adds a small centered logo. Best with Error Correction = H."}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dynamic}
                  onChange={(e) => setDynamic(e.target.checked)}
                  disabled={!canDynamic}
                />
                <span className={canDynamic ? "" : "text-zinc-400"}>
                  Dynamic QR (edit destination later)
                </span>
              </label>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-2 px-4 py-3 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-medium disabled:opacity-60"
            >
              {loading ? "Generating..." : isAuthed ? "Generate & Save" : "Generate"}
            </button>

            {dynamic && !isAuthed && (
              <div className="text-xs text-zinc-500">
                Login required for Dynamic QR.
              </div>
            )}
            {lastQrId && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Saved to history (id: {lastQrId})
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Preview</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                Content: {lastContent ? <span className="break-all">{lastContent}</span> : "—"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            {qrImage ? (
              <img
                src={qrImage}
                alt="QR Preview"
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white"
                style={{ width: style.width, height: style.width }}
              />
            ) : (
              <div className="w-full p-10 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
                Generate a QR to preview here.
              </div>
            )}
          </div>

          <div className="mt-6 grid sm:grid-cols-4 gap-3">
            <button
              onClick={downloadPng}
              disabled={!qrImage}
              className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm disabled:opacity-50"
            >
              Download PNG
            </button>
            <button
              onClick={downloadJpg}
              disabled={!qrImage}
              className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm disabled:opacity-50"
            >
              Download JPG
            </button>
            <button
              onClick={downloadSvg}
              disabled={!lastContent || !isAuthed}
              className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm disabled:opacity-50"
              title={!isAuthed ? "Login to enable SVG download (MVP)" : ""}
            >
              Download SVG
            </button>
            <button
              onClick={printPdf}
              disabled={!qrImage}
              className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 text-sm disabled:opacity-50"
            >
              Print / Save PDF
            </button>
          </div>

          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            Use the Print button to save the QR as a PDF from your browser.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generator;
