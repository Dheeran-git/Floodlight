# FLOODLIGHT — Implementation Status

> Last Updated: 2026-06-13 (Day 1)
> Updated By: Lead Architect

This document tracks the implementation status of every phase. **Start here** when picking up work.

---

# CURRENT STATE

Phase 1 — ✅ COMPLETE
Phase 2 — ✅ COMPLETE
Phase 3 — ✅ COMPLETE
Phase 4 — ✅ COMPLETE
Phase 5 — ✅ COMPLETE (AI uses rule-based fallbacks until API keys are set)
Phase 6 — ✅ COMPLETE (offline support, UI polish, 70-test backend suite)
Phase 7 — ✅ COMPLETE in code (simulation + performance); demo/presentation are manual

---

# QUALITY & TOOLING

- **Wolfram integration**: `optimization/engine/wolfram.py` (Wolfram|Alpha
  client + logistic risk model) drives prediction escalation; falls back to a
  local model without `WOLFRAM_APP_ID`.
- **Real-time**: the frontend connects to the backend `/ws` feed
  (`services/websocket` + `useLiveEvents`); events invalidate the affected
  queries so the map/panels update live (Vite proxies the WS upgrade).
- **Tests (185 automated)**: backend pytest **70** (unit/integration/E2E),
  optimization pytest **26** (graph/routing/allocation/wolfram), frontend
  **Vitest 86** (components/hooks/stores/offline/websocket), **Playwright 3**
  full-stack browser E2E (`frontend/e2e`, `npm run e2e`). All green.
- **Smoke**: `scripts/smoke.sh` — 12 endpoints + WebSocket against a live server.
- **CI**: `.github/workflows/ci.yml` runs backend (ruff + alembic + pytest),
  optimization (ruff + pytest), frontend (eslint + tsc + vitest + build), and a
  full-stack Playwright E2E job.
- **Reviewed & hardened**: a `/code-review` + `/simplify` pass fixed a P0
  allocation inversion, unbounded route growth, a priority-lowering fusion bug,
  an import-time DB-session leak, an offline duplicate-submission risk, a
  form-freeze path, and wired risk zones into the map; then deduped the engine
  bootstrap, removed dead code, and cached per-request command queries.
- **Lint/type**: `ruff check` (backend + optimization) and `tsc --noEmit` +
  `eslint` (frontend) all clean.

---

# PHASE 1 — REPOSITORY FOUNDATION ✅

**Status:** COMPLETE
**Owner:** Lead Architect

Everything is initialized, configured, and verified.

## What Was Done

### Root Configuration

| File | Status | Notes |
|------|--------|-------|
| `.gitignore` | ✅ | Python, Node.js, IDE, OS, DB, logs, coverage, Alembic |
| `.env.example` | ✅ | All env vars documented |
| `.python-version` | ✅ | Set to 3.12 |
| `README.md` | ✅ | Full project docs with teammate onboarding |

### Backend Project

| Item | Status | Notes |
|------|--------|-------|
| `backend/pyproject.toml` | ✅ | FastAPI, SQLAlchemy, Pydantic, uvicorn, alembic, dev tools |
| `backend/ruff.toml` | ✅ | Linting + formatting config, Python 3.12 target |
| `backend/.env.example` | ✅ | Backend-specific env template |
| `backend/.venv/` | ✅ | Created with `uv venv --python 3.12`, 41 packages installed |
| Directory structure | ✅ | `app/{api,models,schemas,services,repositories,utils}` |

### Frontend Project

| Item | Status | Notes |
|------|--------|-------|
| Vite + React + TypeScript | ✅ | Scaffolded with `create-vite`, react-ts template |
| TailwindCSS v4 | ✅ | Installed with `@tailwindcss/vite` plugin |
| Zustand | ✅ | Installed, store placeholders in `src/state/` |
| TanStack Query | ✅ | Installed, configured in `main.tsx` with 30s stale time |
| Framer Motion | ✅ | Installed, ready for Phase 3 animations |
| React Router | ✅ | Installed, routing configured in `App.tsx` |
| Path aliases | ✅ | `@/` → `src/` in both vite.config.ts and tsconfig |
| API proxy | ✅ | `/api` proxied to `http://localhost:8000` |
| ESLint | ✅ | TypeScript-aware config from Vite template |
| Directory structure | ✅ | All component/page/service directories created |

### Optimization Project

| Item | Status | Notes |
|------|--------|-------|
| `optimization/pyproject.toml` | ✅ | NetworkX, NumPy, SciPy |
| `optimization/engine/` | ✅ | Documented stubs: graph.py, routing.py, allocation.py |
| `optimization/tests/` | ✅ | Test package initialized |

---

# PHASE 2 — BACKEND FOUNDATION ✅

**Status:** COMPLETE
**Owner:** Lead Architect

The full FastAPI backend is operational with clean architecture.

## Architecture

```
Request → Router → Service → Repository → Model → Database
            ↑          ↑
         Schemas    Dependencies
        (Pydantic)    (DI)
```

**Key rule:** Routers are thin. Business logic lives in services. Data access lives in repositories.

## Settings & Configuration

| File | Status | Purpose |
|------|--------|---------|
| `app/config.py` | ✅ | Pydantic BaseSettings, env loading, SQLite fallback |
| `app/database.py` | ✅ | SQLAlchemy engine, session factory, `get_db()` dependency |
| `app/dependencies.py` | ✅ | Service factory functions for DI |

**Important:** When `DATABASE_URL` is empty, the app automatically falls back to SQLite (`floodlight_dev.db`). Set `DATABASE_URL` for PostgreSQL.

## Database Models — 8 Tables

All tables from `docs/database.md` are implemented.

| Model | File | Table | Key Fields |
|-------|------|-------|------------|
| Report | `app/models/report.py` | `reports` | text, lat/lng, severity, credibility, status |
| Incident | `app/models/incident.py` | `incidents` | title, description, severity, priority_score, lat/lng |
| IncidentReport | `app/models/incident.py` | `incident_reports` | incident_id FK, report_id FK (M2M) |
| RescueUnit | `app/models/rescue_unit.py` | `rescue_units` | name, type, status, lat/lng, capacity |
| Shelter | `app/models/shelter.py` | `shelters` | name, capacity, current_occupancy, risk_score |
| Route | `app/models/route.py` | `routes` | incident_id FK, unit_id FK, distance, eta |
| OptimizationRun | `app/models/optimization_run.py` | `optimization_runs` | algorithm, input_snapshot (JSON), result (JSON) |
| CommandQuery | `app/models/command_query.py` | `command_queries` | query, response, timestamp |

Indexes created on: `severity`, `priority_score`, `created_at`, `(latitude, longitude)`

Tables are auto-created on startup via `Base.metadata.create_all()`. Use Alembic for production migrations.

## Pydantic Schemas

| File | Schemas | Matches |
|------|---------|---------|
| `app/schemas/common.py` | APIResponse, ErrorResponse, HealthResponse | CLAUDE.md response format |
| `app/schemas/report.py` | ReportCreate, ReportResponse, ReportCreateResponse | POST/GET /reports |
| `app/schemas/incident.py` | IncidentResponse, IncidentDetail | GET /incidents |
| `app/schemas/rescue_unit.py` | RescueUnitResponse, ResourceAssignRequest/Response | GET/POST /resources |
| `app/schemas/shelter.py` | ShelterResponse, ShelterRiskResponse | GET /shelters |
| `app/schemas/optimization.py` | OptimizationRunResponse, OptimizationResultResponse | POST/GET /optimization |
| `app/schemas/command.py` | CommandQueryRequest, CommandQueryResponse | POST /command/query |

## Repositories

| File | Entity | Extra Methods |
|------|--------|---------------|
| `app/repositories/base.py` | Generic[T] | get_by_id, get_all, create, update, delete |
| `app/repositories/report_repository.py` | Report | get_by_severity, get_pending |
| `app/repositories/incident_repository.py` | Incident | get_active, get_by_severity |
| `app/repositories/rescue_unit_repository.py` | RescueUnit | get_available, get_by_type |
| `app/repositories/shelter_repository.py` | Shelter | get_with_capacity, get_high_risk |
| `app/repositories/route_repository.py` | Route | get_by_incident, get_by_unit |

## Services

| File | Real Logic? | Notes |
|------|-------------|-------|
| `app/services/report_service.py` | ✅ Yes | Create + list reports |
| `app/services/incident_service.py` | ✅ Yes | List + detail + active incidents |
| `app/services/resource_service.py` | ✅ Yes | List + assign (updates status) |
| `app/services/shelter_service.py` | ✅ Yes | List + risk calc (occupancy ratio) |
| `app/services/optimization_service.py` | ⚠️ Stub | Creates placeholder run — wire to optimization/ engine in Phase 5 |
| `app/services/command_service.py` | ⚠️ Stub | Returns placeholder — wire to Gemini in Phase 5 |

## API Routers — 12 Endpoints

| File | Endpoints | Status |
|------|-----------|--------|
| `app/api/v1/health.py` | GET /health | ✅ Working |
| `app/api/v1/reports.py` | POST /reports, GET /reports | ✅ Working |
| `app/api/v1/incidents.py` | GET /incidents, GET /incidents/{id} | ✅ Working |
| `app/api/v1/resources.py` | GET /resources, POST /resources/assign | ✅ Working |
| `app/api/v1/shelters.py` | GET /shelters, GET /shelters/risk | ✅ Working |
| `app/api/v1/optimization.py` | POST /optimization/run, GET /optimization/{run_id} | ⚠️ Stub response |
| `app/api/v1/command.py` | POST /command/query | ⚠️ Stub response |

## Tests

| File | Status | Notes |
|------|--------|-------|
| `tests/conftest.py` | ✅ | Fixtures: test DB, session, FastAPI TestClient with DI overrides |
| Test cases | 🔲 | Write test cases for each endpoint |

## Verification Results (Day 1)

| Check | Result |
|-------|--------|
| `uvicorn app.main:app` | ✅ Server starts, all 8 tables auto-created |
| `GET /api/v1/health` | ✅ `{"status": "healthy"}` |
| `POST /api/v1/reports` | ✅ Report created with UUID |
| `GET /api/v1/reports` | ✅ Returns report list |
| Swagger UI at `/docs` | ✅ All 12 endpoints visible |
| TypeScript type check | ✅ Zero errors in frontend |

---

# PHASE 3 — FRONTEND FOUNDATION ✅

**Status:** COMPLETE
**Suggested Owner:** Member 3 (Frontend)
**Priority:** HIGH — Day 2

Delivered: dark-theme dashboard shell (`components/dashboard/`), MapLibre GL map
container (`components/maps/MapContainer.tsx`),
real routing in `App.tsx` (OperationsDesk + CitizenPortal pages), Zustand stores
(`state/`), TanStack Query hooks (`hooks/`), UI primitives (`components/ui/`:
Badge, Card, StatusIndicator, SidePanel), and live incident/resource/shelter
panels fed by the backend. `npx tsc --noEmit` and `npm run build` both pass.

## What Needs To Be Done

### 3.1 Dashboard Layout

Create the main operations dashboard shell:

- Dark theme layout (per CLAUDE.md: "dark dashboards, high contrast indicators")
- Sidebar navigation between views
- Header with app branding
- Main content area (map will go here)
- Status bar showing connection state

**Where to code:** `frontend/src/components/dashboard/`

### 3.2 Map Container

Set up MapLibre GL:

- Install `maplibre-gl`
- Create MapContainer component
- Configure with Bengaluru center coordinates (~12.97, 77.59)
- Dark map style (CARTO Dark Matter style layer JSON)
- Placeholder layers (markers will be added in Phase 5)

**Where to code:** `frontend/src/components/maps/`

**Requires:** None (uses free public tile styles)

### 3.3 Routing

Replace placeholder routes in `App.tsx`:

- `/` → Operations Dashboard (map + panels)
- `/citizen` → Citizen Report Form
- `/operations` → Full operations view (same as / for MVP)
- Route guards based on user role (can be simplified for MVP)

**Where to code:** `frontend/src/App.tsx`, `frontend/src/pages/`

### 3.4 State Management

Create Zustand stores:

```typescript
// frontend/src/state/incidentStore.ts
interface IncidentStore {
  incidents: Incident[]
  selectedIncident: Incident | null
  setIncidents: (incidents: Incident[]) => void
  selectIncident: (id: string) => void
}
```

Create stores for: incidents, resources, shelters, UI state.

**Where to code:** `frontend/src/state/`

### 3.5 API Integration

Wire TanStack Query hooks to the API client:

```typescript
// frontend/src/hooks/useIncidents.ts
export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.incidents.list(),
  })
}
```

**Where to code:** `frontend/src/hooks/`
**API client already exists:** `frontend/src/services/api/client.ts`

### 3.6 Component Architecture

Build base UI components:

- `Badge` — severity indicators (P0 red, P1 orange, P2 yellow, P3 blue)
- `Card` — info panels
- `StatusIndicator` — connection/unit status
- `SidePanel` — collapsible side panel

**Where to code:** `frontend/src/components/ui/`

### Acceptance Criteria

- [x] Dashboard shell renders with dark theme
- [x] Map loads centered on Bengaluru (token-free MapLibre vector layers)
- [x] Navigation works between routes
- [x] Zustand stores created for incidents/resources/shelters
- [x] At least one TanStack Query hook fetches data from backend
- [x] No TypeScript errors (`npx tsc --noEmit`)

---

# PHASE 4 — DATABASE LAYER ✅

**Status:** COMPLETE
**Suggested Owner:** Member 4 (Backend)
**Priority:** MEDIUM — Day 2

Delivered: Alembic initialized (`backend/alembic/`, `alembic.ini`) with `env.py`
wired to `app.config` settings and `Base.metadata`; initial autogenerated
migration (`alembic/versions/b983695acc58_initial_tables.py`) covering all 8
tables, applied via `alembic upgrade head`. Idempotent seed script at
`backend/app/utils/seed.py` (run `python -m app.utils.seed`) loads 7 Bengaluru
shelters, 6 rescue units, 15 reports, and 4 fused incidents. `GET /shelters`,
`/resources`, and `/incidents` return the seeded data.

## What Needs To Be Done

### 4.1 Alembic Migrations

Initialize Alembic and generate migrations:

```bash
cd backend
alembic init alembic
# Configure alembic.ini with DATABASE_URL
# Configure env.py to import Base and models
alembic revision --autogenerate -m "initial tables"
alembic upgrade head
```

**Where to code:** `backend/alembic/`

> Note: Tables are already auto-created on startup. Alembic is for production schema management.

### 4.2 Seed Data

Create seed script with realistic Bengaluru flood data:

```python
# backend/app/utils/seed.py
# - 5-10 shelters (real Bengaluru locations)
# - 5-8 rescue units (boats, vehicles, teams)
# - 10-20 sample reports
# - 3-5 incidents (merged from reports)
```

**Where to code:** `backend/app/utils/seed.py`

Suggested Bengaluru shelter locations:
- Whitefield Community Hall
- Marathahalli Stadium
- Koramangala Indoor Stadium
- Electronic City Convention Center
- Yelahanka Air Force Ground

### 4.3 Repository Enhancements

Add any missing queries discovered during Phase 5 integration.

### Acceptance Criteria

- [x] Alembic migrations generated and applied
- [x] Seed data script runs and populates DB (idempotent)
- [x] Seed data uses realistic Bengaluru coordinates
- [x] `GET /shelters` returns seed data
- [x] `GET /resources` returns seed data

---

# PHASE 5 — CORE FEATURES ✅

**Status:** COMPLETE
**Suggested Owner:** ALL MEMBERS
**Priority:** CRITICAL — Days 3-6

The main feature phase is implemented end-to-end. AI features (triage, command)
use Google Gemini when `GEMINI_API_KEY` is set and fall back to deterministic
rule-based logic otherwise, so the whole pipeline runs and is verifiable without
external keys. Voice transcription requires `ELEVENLABS_API_KEY` (returns 503
otherwise); the live map uses open-source MapLibre GL and does not require a token.

**Delivered**
- 5.1 Citizen reporting: report form (text + geolocation) → `POST /reports`;
  voice endpoint `POST /reports/voice` (ElevenLabs).
- 5.2 AI triage: severity/credibility/category + reasoning
  (`app/services/triage/`); GPS-proximity incident fusion (<500m).
- 5.3 Optimization engine: NetworkX flood-aware routing + SciPy min-cost
  allocation + shelter balancing (`optimization/engine/`), wired through
  `optimization_service` → `POST /optimization/run` with reasoned deployment plan.
- 5.4 Live crisis map: report/incident/unit/shelter marker layers with popups.
- 5.5 Predictive escalation: risk-zone forecasting (`GET /prediction/risk`).
- 5.6 WebSockets: `/api/v1/ws` broadcasting report/incident/resource/optimization
  events (`app/services/events.py`).
- 5.7 Command intelligence: context-aware operational Q&A with reasoning.

**Verified (no keys):** report → triage (P0) → fusion; optimization returns 4
reasoned assignments + routes + shelter advice; prediction returns risk zones;
command answers all three example questions; WebSocket delivers live events.

---

## 5.1 Citizen Reporting (Member 3 + Member 4)

### Frontend — Citizen Report Form

Build the report submission UI:

- Text input for report description
- GPS capture (browser geolocation API)
- Voice recording + ElevenLabs transcription
- Offline queue (IndexedDB + Service Workers)
- Submit button → `POST /api/v1/reports`

**Where to code:** `frontend/src/pages/CitizenPortal/`, `frontend/src/components/`

### Backend — Report Processing

The `POST /reports` endpoint already works. Add:

- Voice upload endpoint (multipart form)
- ElevenLabs STT integration
- Trigger AI triage after report creation

**Where to code:** `backend/app/api/v1/reports.py`, `backend/app/services/report_service.py`

---

## 5.2 AI Triage Engine (Member 1)

### Gemini Integration

After a report is created, run it through Gemini for triage:

```python
# backend/app/services/triage/
# - Send report text to Gemini API
# - Parse response: severity, credibility, category, reasoning
# - Update report with AI results
# - Trigger incident fusion
```

**Where to code:** Create `backend/app/services/triage/` directory

**Severity levels (CLAUDE.md):**
- P0 = Immediate Life Threat (trapped, drowning, medical)
- P1 = Critical (stranded, rapidly rising water)
- P2 = Serious (blocked roads, moderate flooding)
- P3 = Informational (water accumulation, traffic)

**Requirements:**
- Every classification must include `reasoning` (CLAUDE.md: "Every recommendation requires reasoning")
- `GEMINI_API_KEY` must be set in `.env`

### Incident Fusion

Merge duplicate reports into incidents:

```python
# backend/app/services/triage/fusion.py
# - Embedding similarity (Gemini embeddings)
# - GPS proximity (< 500m = likely same event)
# - LLM validation (confirm merge)
# - Create or update Incident, link via IncidentReport
```

**Where to code:** `backend/app/services/triage/`

### ElevenLabs Integration

```python
# backend/app/services/triage/transcription.py
# - Accept audio file
# - Send to ElevenLabs API
# - Return transcribed text
```

---

## 5.3 Optimization Engine (Member 2)

### NetworkX Graph

Build Bengaluru road network graph:

```python
# optimization/engine/graph.py
# - Create weighted graph from road network
# - Edges: distance + flood risk + blockage status
# - Nodes: intersections / key locations
```

### Route Optimization

```python
# optimization/engine/routing.py
# - Dijkstra shortest safe path
# - A* with flood-aware heuristic
# - Return: route coords, distance, ETA
```

### Resource Allocation

```python
# optimization/engine/allocation.py
# - Min-cost assignment: units → incidents
# - Priority: P0 first, then closest available unit
# - Consider unit type compatibility
```

### Shelter Balancing

```python
# optimization/engine/allocation.py
# - Predict overflow (occupancy trend + predicted arrivals)
# - Suggest redistribution
# - Time-to-saturation calculation
```

### Backend Integration

Wire optimization engine to the backend service:

```python
# backend/app/services/optimization_service.py
# - Replace stub with real optimization calls
# - Import from optimization.engine
# - Store results in OptimizationRun table
```

### Wolfram Integration

```python
# optimization/engine/wolfram.py (NEW)
# - Risk simulation
# - Advanced resource optimization
# - Shelter balancing algorithms
# Requires: WOLFRAM_APP_ID in .env
```

---

## 5.4 Live Crisis Map (Member 3)

### Map Layers

Add MapLibre layers for each data type:

| Layer | Visualization | Data Source |
|-------|--------------|-------------|
| SOS Reports | Colored markers by severity | `GET /reports` |
| Incidents | Pulsing markers + info popup | `GET /incidents` |
| Rescue Teams | Vehicle icons with status | `GET /resources` |
| Shelters | Building icons with capacity bar | `GET /shelters` |
| Blocked Roads | Red dashed polylines | Manual / optimization |
| Flood Zones | Semi-transparent blue polygons | Simulated data |
| Routes | Animated polylines | `GET /optimization/{id}` |
| Risk Zones | Heatmap layer | Predictive escalation |

**Where to code:** `frontend/src/components/maps/`

### Real-Time Updates via WebSocket

```typescript
// frontend/src/services/websocket/
// Events to handle:
// - report_created
// - incident_updated
// - route_generated
// - resource_assigned
// - shelter_updated
// - risk_changed
// - optimization_complete
```

---

## 5.5 Command Intelligence (Member 1)

### Gemini-Powered Q&A

```python
# backend/app/services/command/
# 1. Parse operational query
# 2. Retrieve relevant context (incidents, shelters, resources)
# 3. Include optimization results
# 4. Send to Gemini with operational context
# 5. Return structured answer with reasoning
```

**Replace stub in:** `backend/app/services/command_service.py`

### Frontend Command Panel

```
frontend/src/components/command/
# - Text input for operational queries
# - Response display with reasoning
# - Example queries as quick-buttons
```

---

## 5.6 WebSocket Events (Member 4)

### Backend WebSocket

```python
# backend/app/api/v1/websocket.py (NEW)
# - FastAPI WebSocket endpoint
# - Broadcast events on data changes
# - Connection management
```

### Event Types (per ARCHITECTURE.md)

```
report_created
incident_created
incident_updated
route_generated
resource_assigned
risk_changed
shelter_updated
optimization_complete
```

---

## 5.7 Predictive Escalation (Member 2)

```python
# backend/app/services/prediction/ (NEW)
# Risk Score = (Severity × Weight) + (Proximity × Weight) + (Trend × Weight)
# Inputs: current incidents, road status, shelter occupancy, time
# Outputs: risk score, escalation probability, predicted overload
```

---

## Phase 5 Acceptance Criteria

- [x] Citizen can submit text report → appears on map
- [x] Voice report is transcribed and triaged (endpoint live; needs `ELEVENLABS_API_KEY`)
- [x] AI assigns severity (P0-P3) with reasoning
- [x] Duplicate reports merge into single incident
- [x] Map shows all entities (incidents, units, shelters, routes, risk zones)
- [x] Optimization assigns unit to incident, generates route
- [x] Shelter overflow prediction works
- [x] Command query returns intelligent answer
- [x] WebSocket events update map in real-time
- [x] Risk zones display on map

---

# PHASE 6 — POLISH, OFFLINE & TESTING ✅

**Status:** COMPLETE
**Priority:** Day 6

- **Offline support** (`frontend/src/services/offline/reportQueue.ts`,
  `hooks/useOfflineSync.ts`, `hooks/useOnlineStatus.ts`): citizen reports queue
  in IndexedDB when offline or on network failure and auto-flush on reconnect;
  online/offline indicators in the UI.
- **Service worker** (`frontend/public/sw.js`): versioned cache, cache-first
  static assets, `/api` passthrough, offline app-shell fallback; registered in
  `main.tsx`.
- **Degraded mode** (`components/dashboard/DegradedBanner.tsx`): operator
  dashboard shows a banner and keeps the last known state when disconnected.
- **Testing**: 70-test backend suite in `backend/tests/` (unit + integration +
  E2E), all passing; ruff clean. Optimization engine adds 16 tests.
- **UI polish**: map severity legend; clearer loading/empty states.

---

# PHASE 7 — SIMULATION, PERFORMANCE & DEMO ✅ (code)

**Status:** COMPLETE in code. Presentation & demo recording are manual tasks.
**Priority:** Day 7

- **Simulation** (`backend/app/services/simulation_service.py`,
  `POST /simulation/run`): injects a scripted "heavy rain" scenario of escalating
  reports through the live triage → fusion → WebSocket pipeline; triggered from
  the dashboard via `SimulationButton`. Maps to the demo script (docs/plan.md §24).
- **Performance**: MapLibre is code-split via `LazyMap` (React.lazy/Suspense);
  the main entry chunk dropped from ~2,055 kB to ~289 kB.
- **Bug fixes**: resolved the oversized-bundle build warning; hardened
  `publish_event` against a non-running event loop.
- **Presentation / demo recording**: require a human (screen recording, narration).

---

# QUICK REFERENCE

## How to Run

```bash
# Terminal 1: Backend
cd backend
.venv\Scripts\activate    # Windows
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Key Files For Each Role

### Member 1 (AI/NLP)
- `backend/app/services/triage/` — Create this directory
- `backend/app/services/command_service.py` — Replace stub
- `backend/app/utils/prompts/` — Create this directory for Gemini prompts

### Member 2 (Optimization)
- `optimization/engine/graph.py` — Replace stub
- `optimization/engine/routing.py` — Replace stub
- `optimization/engine/allocation.py` — Replace stub
- `backend/app/services/optimization_service.py` — Wire real engine
- `backend/app/services/prediction/` — Create this directory

### Member 3 (Frontend)
- `frontend/src/components/maps/` — MapLibre layers
- `frontend/src/components/dashboard/` — Dashboard layout
- `frontend/src/pages/CitizenPortal/` — Report form
- `frontend/src/pages/OperationsDesk/` — Main dashboard
- `frontend/src/state/` — Zustand stores
- `frontend/src/hooks/` — TanStack Query hooks

### Member 4 (Backend)
- `backend/app/utils/seed.py` — Seed data
- `backend/app/api/v1/websocket.py` — WebSocket endpoint
- `backend/alembic/` — Migrations
- `backend/tests/` — Write test cases

## Environment Variables Needed

```
GEMINI_API_KEY=        # Member 1 needs this
ELEVENLABS_API_KEY=    # Member 1 needs this
# No MAPBOX_TOKEN needed (MapLibre is token-free)
WOLFRAM_APP_ID=        # Member 2 needs this
DATABASE_URL=          # Member 4 for PostgreSQL
```

## Engineering Rules (from CLAUDE.md)

- No JavaScript in frontend — TypeScript only
- No inline styles — use TailwindCSS
- No hardcoded API endpoints — use `api` client
- No business logic in React components
- Every function: single responsibility, type hints, docstrings
- Max function length: 50 lines
- Max file length: 500 lines
- All AI recommendations must include reasoning

---

# TIMELINE

| Day | Focus | Status |
|-----|-------|--------|
| Day 1 | Project setup, backend skeleton, frontend skeleton | ✅ DONE |
| Day 2 | Citizen reporting, ElevenLabs, Gemini triage, report storage | 🔲 |
| Day 3 | Incident fusion, live map, WebSockets, severity visualization | 🔲 |
| Day 4 | Optimization engine, NetworkX, route planning, resource assignment | 🔲 |
| Day 5 | Wolfram integration, risk scoring, shelter prediction, escalation | 🔲 |
| Day 6 | Command layer, offline support, UI polish, testing | 🔲 |
| Day 7 | Simulation, performance, bug fixes, demo recording, presentation | 🔲 |

---

# HACKATHON PRIORITY ORDER (if time runs out)

Ship in this order:

1. **Map** — centerpiece of the product
2. **Optimization** — core differentiator
3. **AI Triage** — makes reports actionable
4. **Command Layer** — decision support
5. **Offline Support** — nice to have

A judge should understand the platform within 15 seconds. The map is primary. Everything else supports the map.

---

END OF STATUS.MD
