# Floodlight Backend

FastAPI backend for the Floodlight disaster operations copilot.

> **Status:** Phase 2 COMPLETE. Server is fully operational with 12 API endpoints.
> See [docs/status.md](../docs/status.md) for what needs real business logic.

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
| POST | /api/v1/optimization/run | ⚠️ Stub |
| GET | /api/v1/optimization/{run_id} | ⚠️ Stub |
| POST | /api/v1/command/query | ⚠️ Stub |

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
├── services/        # Business logic (add Gemini/optimization here)
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

## Adding Business Logic

When implementing Phase 5 features:

1. **AI Triage:** Create `app/services/triage/` → import in `report_service.py`
2. **Optimization:** Wire `optimization/engine/` into `optimization_service.py`
3. **Command:** Replace stub in `command_service.py` with Gemini calls
4. **WebSocket:** Create `app/api/v1/websocket.py`
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
