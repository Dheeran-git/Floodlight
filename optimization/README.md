# Floodlight Optimization Engine

Graph-based optimization for rescue routing, resource allocation, and shelter balancing.

> **Status:** COMPLETE. NetworkX flood-aware graph + A* routing, SciPy min-cost
> allocation, shelter balancing, and a Wolfram risk-simulation module are
> implemented (`engine/`). 26 pytest tests. See [docs/status.md](../docs/status.md).

## Quick Start

```bash
uv venv --python 3.12
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux
uv pip install -e ".[dev]"
```

## Stack

| Library | Purpose |
|---------|---------|
| NetworkX | Graph construction, Dijkstra/A* pathfinding |
| NumPy | Numerical computation |
| SciPy | Optimization algorithms |
| Wolfram Client | Risk simulation, advanced optimization (Phase 5) |

## Structure

```
engine/
├── __init__.py
├── graph.py        # Road network graph construction
├── routing.py      # Dijkstra / A* safe route finding
└── allocation.py   # Min-cost resource assignment + shelter balancing
```

## Engine Modules

### graph.py — Road Network

- Build weighted NetworkX graph for Bengaluru
- Nodes: intersections, shelters, incident locations
- Edges: roads weighted by distance, flood risk, blockage
- Function to update weights when flood data changes

### routing.py — Safe Routes

- `find_safe_route(graph, unit_location, incident_location)` — Dijkstra/A*
- `find_evacuation_route(graph, location, shelters)` — nearest safe shelter
- Must avoid flooded zones
- Must prioritize human life over shortest distance (CLAUDE.md rule)

### allocation.py — Resource Assignment

- `allocate_resources(incidents, units)` — min-cost assignment
- Priority order: P0 > P1 > P2 > P3, then closest unit
- `balance_shelters(shelters, predicted_arrivals)` — prevent overflow

### wolfram.py — Risk Simulation

- `simulate_risk_escalation(...)` — logistic risk projection via Wolfram|Alpha
  when `WOLFRAM_APP_ID` is set, or an identical local model otherwise.

### Backend Integration (wired)

`backend/app/services/optimization_service.py` builds engine inputs from live
data and calls these functions (via `app/utils/engine.py`, which bridges the
namespace import). Prediction uses `wolfram` the same way.

```python
from optimization.engine.graph import build_road_graph
from optimization.engine.routing import find_safe_route
from optimization.engine.allocation import allocate_resources
```

## Tests

```bash
pytest
```

Priority test cases:
- Route avoids flooded edges
- P0 incidents get assigned before P1
- Shelter redistribution triggers when occupancy > 80%
