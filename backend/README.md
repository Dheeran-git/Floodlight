# Floodlight Backend

FastAPI backend for the Floodlight disaster operations copilot.

> **Status:** Phases 1–7 COMPLETE. AI triage, incident fusion, optimization,
> prediction, command intelligence, WebSockets, and simulation are implemented
> (Gemini/Whisper/Wolfram use rule-based fallbacks without API keys). 70 pytest
> tests. See [docs/status.md](../docs/status.md).

## Quick Start

```bash
# Create virtual environment (first time only)
uv venv --python 3.12

# Activate
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

# Install dependencies
uv pip install -e ".[dev]"

# Start the server
uvicorn app.main:app --reload
```

## Endpoints

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health:** http://localhost:8000/api/v1/health

| Method | Endpoint | Working |
|--------|----------|---------|
| GET | /api/v1/health | ✅ |
| POST | /api/v1/reports | ✅ |
| GET | /api/v1/reports | ✅ |
| GET | /api/v1/incidents | ✅ |
| GET | /api/v1/incidents/{id} | ✅ |
| GET | /api/v1/resources | ✅ |
| POST | /api/v1/resources/assign | ✅ |
| GET | /api/v1/shelters | ✅ |
| GET | /api/v1/shelters/risk | ✅ |
| POST | /api/v1/reports/voice | ✅ (needs `WHISPER_API_KEY`) |
| POST | /api/v1/optimization/run | ✅ |
| GET | /api/v1/optimization/{run_id} | ✅ |
| GET | /api/v1/prediction/risk | ✅ |
| POST | /api/v1/command/query | ✅ |
| POST | /api/v1/simulation/run | ✅ |
| WS | /api/v1/ws | ✅ |

## Architecture

```
Request → Router → Service → Repository → Model → Database
            ↑          ↑
         Schemas    Dependencies
        (Pydantic)    (DI)
```

```
app/
├── api/v1/          # Route handlers (thin — no business logic)
├── models/          # SQLAlchemy ORM models (8 tables)
├── schemas/         # Pydantic request/response schemas
├── services/        # Business logic (triage, optimization, prediction, command, events)
├── repositories/    # Data access layer (SQL queries)
├── utils/           # Shared utilities
├── config.py        # Settings management (reads .env)
├── database.py      # Database engine + session
├── dependencies.py  # Dependency injection factories
└── main.py          # FastAPI app entry point
```

## Database

- **Local dev:** SQLite (automatic fallback when `DATABASE_URL` is empty)
- **Production:** PostgreSQL (set `DATABASE_URL` in `.env`)
- Tables are auto-created on startup
- Use Alembic for production migrations

## Business Logic (implemented)

1. **AI Triage:** `app/services/triage/` (classifier + fusion), called from `report_service.py`
2. **Optimization:** `optimization/engine/` wired via `optimization_service.py`
3. **Prediction:** `app/services/prediction/` → `GET /prediction/risk`
4. **Command:** `command_service.py` (Gemini or rule-based, with reasoning)
5. **WebSocket:** `app/api/v1/websocket.py` + `app/services/events.py`

AI services (triage, command) use Gemini when `GEMINI_API_KEY` is set and a
deterministic rule-based engine otherwise.
5. **Seed Data:** Create `app/utils/seed.py`

## Lint & Format

```bash
ruff check .
ruff format .
```

## Tests

```bash
pytest
```

Test fixtures are configured in `tests/conftest.py` with:
- Separate test database (SQLite)
- Auto table create/drop per test
- FastAPI TestClient with DI overrides
