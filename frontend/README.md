# Floodlight Frontend

React + TypeScript + Vite frontend for the Floodlight disaster operations copilot.

> **Status:** Phase 1 COMPLETE. Project scaffolded with all dependencies and directory structure.
> Phase 3 (dashboard layout, map, state management) is next.
> See [docs/status.md](../docs/status.md) for detailed Phase 3 requirements.

## Quick Start

```bash
npm install
npm run dev
```

- **Dev server:** http://localhost:5173
- API calls to `/api` are proxied to `http://localhost:8000` (backend must be running)

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tooling |
| TailwindCSS | 4.x | Styling (via `@tailwindcss/vite` plugin) |
| Zustand | latest | State management |
| TanStack Query | latest | Server state / data fetching |
| Framer Motion | latest | Animations |
| React Router | latest | Client-side routing |
| Mapbox GL JS | — | Crisis map (install in Phase 3) |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── maps/            # Mapbox map layers & controls
│   ├── dashboard/       # Dashboard layout panels
│   ├── incidents/       # Incident list, detail, severity badges
│   ├── resources/       # Rescue unit cards, assignment UI
│   ├── shelters/        # Shelter capacity, risk indicators
│   ├── command/         # Operational Q&A interface
│   └── ui/              # Shared primitives (Badge, Card, etc.)
│
├── pages/               # Route-level page components
│   ├── CitizenPortal/   # Report submission form
│   ├── OperationsDesk/  # Crisis map + command dashboard
│   └── Admin/           # System configuration
│
├── services/
│   ├── api/client.ts    # ← API client (all endpoints wired)
│   └── websocket/       # WebSocket real-time events
│
├── state/               # Zustand stores (create in Phase 3)
├── hooks/               # Custom hooks + TanStack Query hooks
├── types/index.ts       # ← TypeScript types (Severity, Status, etc.)
└── utils/               # Utility functions
```

## Path Aliases

`@/` resolves to `src/`:

```typescript
import { api } from '@/services/api/client'
import type { Severity } from '@/types'
```

Configured in both `vite.config.ts` and `tsconfig.app.json`.

## API Client

All backend endpoints are already wired in `src/services/api/client.ts`:

```typescript
import { api } from '@/services/api/client'

// Examples:
const health = await api.health.check()
const reports = await api.reports.list()
const result = await api.reports.create({ text: '...', latitude: 12.98, longitude: 77.72 })
const incidents = await api.incidents.list()
const answer = await api.command.query('Which area is highest risk?')
```

## Key Rules (from CLAUDE.md)

- **No JavaScript** — TypeScript only
- **No inline styles** — Use TailwindCSS classes
- **No hardcoded endpoints** — Use the `api` client
- **No business logic in components** — Use hooks/services/state
- **Dark dashboard theme** — Per CLAUDE.md UI principles

## Next Steps (Phase 3)

1. Install Mapbox GL JS: `npm install mapbox-gl @types/mapbox-gl`
2. Create dashboard layout in `components/dashboard/`
3. Create Mapbox container in `components/maps/`
4. Create Zustand stores in `state/`
5. Create TanStack Query hooks in `hooks/`
6. Build UI primitives in `components/ui/`

See [docs/status.md](../docs/status.md) → Phase 3 for full checklist.

## Type Check

```bash
npx tsc --noEmit
```

## Lint

```bash
npx eslint .
```
