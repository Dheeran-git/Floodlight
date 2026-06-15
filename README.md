# 🔦 Floodlight

> *"Clarity when the water rises."*

**Floodlight** is an AI-powered Disaster Operations Copilot designed for urban flood response in Bengaluru. It transforms chaotic citizen reports into a single operational picture that helps emergency responders prioritize, allocate resources, and optimize rescue operations.

**Team:** Boolean Bandits
**Track:** AI for Social Impact
**Duration:** 7-Day Hackathon

---

## What Floodlight Does

| Module | Description | Status |
|--------|-------------|--------|
| **Citizen Reporting** | Text/voice reports with GPS, offline queueing | ✅ Text + GPS + offline queue · voice needs `ELEVENLABS_API_KEY` |
| **AI Triage** | Automatic severity scoring, credibility analysis, duplicate fusion | ✅ Gemini or rule-based fallback |
| **Live Crisis Map** | Real-time operational picture with incidents, resources, shelters, routes | ✅ Built with token-free `maplibre-gl` |
| **Predictive Escalation** | Forecast worsening areas before they become critical | ✅ `GET /prediction/risk` · Wolfram or local model |
| **Optimization Engine** | Resource allocation, route planning, shelter balancing | ✅ NetworkX + SciPy · Wolfram risk sim |
| **Command Intelligence** | Operational Q&A with AI-powered reasoning | ✅ Gemini or rule-based fallback |

> See [STATUS.md](docs/status.md) for detailed implementation progress.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS v4, MapLibre GL, Framer Motion, Zustand, TanStack Query |
| **Backend** | FastAPI, Python 3.12, SQLAlchemy 2.0, PostgreSQL (SQLite fallback), Pydantic v2 |
| **AI** | Gemini API, ElevenLabs Speech-to-Text API |
| **Optimization** | NetworkX, Wolfram Language |
| **Deployment** | Railway (backend), Vercel (frontend) |

---

## Project Structure

```
floodlight/
├── backend/                # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/v1/         # Route handlers (REST + WebSocket)
│   │   ├── models/         # SQLAlchemy ORM models (8 tables)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic layer
│   │   ├── repositories/   # Data access layer
│   │   ├── utils/          # Shared utilities
│   │   ├── config.py       # Settings management
│   │   ├── database.py     # Database connection
│   │   ├── dependencies.py # Dependency injection
│   │   └── main.py         # Application entry point
│   ├── tests/              # Pytest test suite
│   └── alembic/            # Database migrations
│
├── frontend/               # React + TypeScript + Vite
│   └── src/
│       ├── components/     # maps, dashboard, incidents, resources,
│       │                   # shelters, command, ui
│       ├── pages/          # CitizenPortal, OperationsDesk, Admin
│       ├── services/       # API client, WebSocket
│       ├── state/          # Zustand stores
│       ├── hooks/          # Custom React hooks
│       ├── types/          # TypeScript definitions
│       └── utils/          # Utility functions
│
├── optimization/           # NetworkX + Wolfram
│   ├── engine/
│   │   ├── graph.py        # Road network graph
│   │   ├── routing.py      # Dijkstra / A* pathfinding
│   │   └── allocation.py   # Resource assignment
│   └── tests/
│
├── docs/                   # Specification documents
│   ├── claude.md           # Project constitution
│   ├── plan.md             # Execution roadmap
│   ├── architecture.md     # System architecture
│   ├── api_spec.md         # API contracts
│   ├── database.md         # Database schema
│   └── status.md           # Implementation status tracker
│
├── infrastructure/         # Deployment configs (pending)
└── assets/                 # Static assets (pending)
```

---

## Getting Started

### Prerequisites

- **Python 3.12+** (via pyenv or uv)
- **Node.js 18+**
- **uv** (recommended) or pip for Python package management
- PostgreSQL (optional — SQLite is used as fallback for local dev)

### Backend Setup

```bash
cd backend

# Create virtual environment
uv venv --python 3.12

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
uv pip install -e ".[dev]"

# Start the server
uvicorn app.main:app --reload
```

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health check:** http://localhost:8000/api/v1/health

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- **Dev server:** http://localhost:5173
- API proxy automatically forwards `/api` → `http://localhost:8000`

### Optimization Setup

```bash
cd optimization
uv venv --python 3.12
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uv pip install -e ".[dev]"
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/health` | Health check | ✅ |
| POST | `/reports` | Create citizen report | ✅ |
| GET | `/reports` | List all reports | ✅ |
| GET | `/incidents` | List all incidents | ✅ |
| GET | `/incidents/{id}` | Get incident details | ✅ |
| GET | `/resources` | List rescue units | ✅ |
| POST | `/resources/assign` | Assign unit to incident | ✅ |
| GET | `/shelters` | List shelters | ✅ |
| GET | `/shelters/risk` | Get overflow predictions | ✅ |
| POST | `/reports/voice` | Voice report (ElevenLabs) | ✅ (needs `ELEVENLABS_API_KEY`) |
| POST | `/optimization/run` | Trigger optimization | ✅ |
| GET | `/optimization/{run_id}` | Get optimization results | ✅ |
| GET | `/prediction/risk` | Forecasted risk zones | ✅ |
| POST | `/command/query` | Operational Q&A | ✅ |
| POST | `/simulation/run` | Inject heavy-rain scenario | ✅ |
| WS | `/ws` | Real-time event feed | ✅ |

> AI features (triage, command) use Gemini when `GEMINI_API_KEY` is set and a
> deterministic rule-based engine otherwise. See [STATUS.md](docs/status.md).

---

## Documentation Hierarchy

Documents are the **source of truth**. If conflicts are found:

**CLAUDE.md > PLAN.md > ARCHITECTURE.md > API_SPEC.md > DATABASE.md**

| Document | Purpose |
|----------|---------|
| [claude.md](docs/claude.md) | Project constitution, engineering rules, non-negotiable principles |
| [plan.md](docs/plan.md) | Full execution roadmap, module specs, timeline |
| [architecture.md](docs/architecture.md) | System components, event flow, security |
| [api_spec.md](docs/api_spec.md) | REST API contracts with request/response examples |
| [database.md](docs/database.md) | PostgreSQL schema, relationships, indexes |
| [status.md](docs/status.md) | **Implementation progress tracker — start here** |

---

## For Teammates

**Start by reading [docs/status.md](docs/status.md).** It has:

1. What's been built and verified
2. What each pending phase requires
3. File-by-file guidance on where to add code
4. Key architectural decisions already made

### Quick Orientation

- **Backend architecture:** Routers → Services → Repositories → Models. Never put business logic in routers.
- **Frontend architecture:** Pages → Components → Services/Hooks → State. Never put business logic in React components.
- **Path alias:** Frontend uses `@/` → `src/` (e.g., `import { api } from '@/services/api/client'`)
- **API response format:** `{ "success": true, "data": {}, "timestamp": "" }` per CLAUDE.md
- **No hardcoded endpoints.** Use the API client at `frontend/src/services/api/client.ts`

---

## License

This project is developed for hackathon purposes.
