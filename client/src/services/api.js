import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://qrverse-backend-f3kr.onrender.com/api"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("qrverse_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authRegister = (payload) => API.post("/auth/register", payload);
export const authLogin = (payload) => API.post("/auth/login", payload);
export const authMe = () => API.get("/auth/me");

export const qrGenerate = (payload) => API.post("/qr/generate", payload);
export const qrPublicGenerate = (payload) => API.post("/qr/public/generate", payload);
export const qrHistory = (limit = 50) => API.get(`/qr/history?limit=${limit}`);
export const qrAnalytics = () => API.get("/qr/analytics");
export const qrUpdateDestination = (id, destinationUrl) =>
  API.patch(`/qr/${id}/destination`, { destinationUrl });
export const qrRenderSvg = (content, style) =>
  API.post("/qr/render/svg", { content, style });

export const sendContact = (payload) => API.post("/contact", payload);

export default API;
