# QRVerse – Smart QR Code Generator (MVP)

This repo contains:
- `client/` (React + Vite + Tailwind)
- `server/` (Node + Express + MongoDB + JWT)

## 1) Environment variables

### Server (`server/.env`)

Already exists; ensure it contains:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/qr-verse
JWT_SECRET=your-secret
PUBLIC_BASE_URL=http://localhost:5000
```

`PUBLIC_BASE_URL` is required for **Dynamic QR** (the QR encodes `PUBLIC_BASE_URL/r/:slug`).

### Client (`client/.env`)

Create `client/.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 2) Install + run (local dev)

### Backend

```
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### Frontend

```
cd client
npm install
npm run dev
```

Frontend runs on the Vite URL shown in your terminal (usually `http://localhost:5173`).

## 3) What’s included in this MVP

- QR types: URL, Text, WiFi, Email, Phone, WhatsApp, UPI
- Customization: size, foreground/background color, margin, error correction
- Logo upload: client overlays logo on the PNG preview
- Downloads: PNG + JPG (SVG download requires login in this MVP)
- Auth: Register + Login (JWT)
- Dashboard: History + Analytics + Settings
- Dynamic QR: generate a QR that redirects via `GET /r/:slug`, supports updating destination later
- Public API: `POST /api/qr/public/generate` (optional `x-api-key` to also store into your account history)

## 4) API quick test

Public (no auth):

```
curl -X POST http://localhost:5000/api/qr/public/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"url\",\"payload\":{\"url\":\"https://example.com\"},\"style\":{\"width\":320}}"
```

Authenticated (stores history):

1) Register / Login to get a token.
2) Call:

```
curl -X POST http://localhost:5000/api/qr/generate ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_JWT" ^
  -d "{\"type\":\"text\",\"payload\":{\"text\":\"Hello\"},\"style\":{\"width\":320}}"
```

