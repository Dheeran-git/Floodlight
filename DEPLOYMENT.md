# Deploying Floodlight

Floodlight is a full stack app, so it deploys as **two** services:

| Part | Host | Why |
| --- | --- | --- |
| Frontend (Vite/React SPA) | **Vercel** | Static SPA, global CDN |
| Backend (FastAPI + Postgres + WebSockets) | **Render** | Persistent server, real DB, WebSocket support |

The frontend talks to the backend over HTTPS + WSS, so deploy the **backend
first**, then point the frontend at it, then allow the frontend's origin in the
backend's CORS list.

---

## 1. Backend on Render

1. Push this repo to GitHub (the `render.yaml` Blueprint lives at the repo root).
2. In the [Render dashboard](https://dashboard.render.com): **New → Blueprint**,
   pick this repo. Render reads `render.yaml` and provisions:
   - a free PostgreSQL database (`floodlight-db`), and
   - the `floodlight-api` web service.
3. The blueprint wires `DATABASE_URL` automatically. On first deploy the start
   command runs `alembic upgrade head` + seeds the demo data, then starts
   uvicorn. Both steps are idempotent, so every redeploy is safe.
4. Leave `CORS_ORIGINS` blank for now (you'll set it in step 3). The AI keys
   (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `WOLFRAM_APP_ID`) are optional —
   without them the app uses deterministic fallbacks.
5. When it's live, copy the service URL, e.g. `https://floodlight-api.onrender.com`,
   and confirm `https://floodlight-api.onrender.com/api/v1/health` returns `ok`.

> Note: Render's **free** Postgres and web instances sleep when idle and the
> free database expires after a fixed window — fine for a demo, upgrade for
> anything real.

## 2. Frontend on Vercel

1. In [Vercel](https://vercel.com): **Add New → Project**, import this repo.
2. Set **Root Directory** to `frontend` (Vercel then auto-detects Vite and
   uses `frontend/vercel.json` for SPA routing).
3. Add an **Environment Variable**:
   - `VITE_API_URL = https://floodlight-api.onrender.com/api/v1`
     (your Render URL from step 1, **including** `/api/v1`). The WebSocket feed
     URL is derived from this automatically.
4. **Deploy**, then copy the resulting URL, e.g. `https://floodlight.vercel.app`.

## 3. Connect them (CORS)

1. Back in Render → `floodlight-api` → **Environment**, set:
   - `CORS_ORIGINS = https://floodlight.vercel.app`
     (add more comma-separated origins if you have preview/custom domains).
2. Save — Render redeploys. Done: open the Vercel URL and the dashboard, map,
   reports, optimization, and live WebSocket updates all work against Render.

---

## Local development (unchanged)

```bash
# backend
cd backend && uv sync --extra dev && alembic upgrade head \
  && python -m app.utils.seed && uvicorn app.main:app

# frontend (separate terminal)
cd frontend && npm install && npm run dev   # proxies /api -> localhost:8000
```

No `VITE_API_URL` is needed locally — the Vite dev proxy handles `/api` and the
WebSocket upgrade.
