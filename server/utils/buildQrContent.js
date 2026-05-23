const encode = (value) => encodeURIComponent(String(value ?? ""));

const normalizeUrl = (rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;
  const isLocal = /^(localhost|127(?:\.\d+){0,2}\.\d+|10(?:\.\d+){0,2}\.\d+|172\.(1[6-9]|2\d|3[0-1])(?:\.\d+){0,2}\.\d+|192\.168(?:\.\d+){0,2}\.\d+)(:\d+)?(\/.*)?$/i;
  return isLocal.test(url) ? `http://${url}` : `https://${url}`;
};

export const buildQrContent = ({ type, payload }) => {
  const t = String(type || "").toLowerCase();
  const p = payload || {};

  if (t === "url") return normalizeUrl(p.url);
  if (t === "text") return String(p.text || "");

  if (t === "wifi") {
    const ssid = String(p.ssid || "");
    const password = String(p.password || "");
    const security = String(p.security || "WPA").toUpperCase();
    const hidden = p.hidden ? "true" : "false";
    return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
  }

  if (t === "email") {
    const to = String(p.to || "");
    const subject = encode(p.subject || "");
    const body = encode(p.body || "");
    const qs = `subject=${subject}&body=${body}`;
    return `mailto:${to}?${qs}`;
  }

  if (t === "phone") {
    return `tel:${String(p.phone || "")}`;
  }

  if (t === "whatsapp") {
    const phone = String(p.phone || "").replace(/[^\d]/g, "");
    const text = encode(p.text || "");
    return `https://wa.me/${phone}?text=${text}`;
  }

  if (t === "upi") {
    const pa = encode(p.pa || "");
    const pn = encode(p.pn || "");
    const am = p.am != null && p.am !== "" ? `&am=${encode(p.am)}` : "";
    const tn = p.tn != null && p.tn !== "" ? `&tn=${encode(p.tn)}` : "";
    const cu = encode(p.cu || "INR");
    return `upi://pay?pa=${pa}&pn=${pn}${am}${tn}&cu=${cu}`;
  }

  return String(p.text || "");
};

