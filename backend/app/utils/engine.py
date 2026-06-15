"""Bridge to the monorepo ``optimization`` package.

Centralizes the one-time ``sys.path`` insertion that makes the sibling
``optimization`` package importable (it is a PEP 420 namespace package living
outside ``backend/``). Import the engine modules from here instead of repeating
the bootstrap in every service.

``ENGINE_AVAILABLE`` is False (and the module attributes are None) if the
optional optimization dependencies are not installed, so callers can degrade
gracefully.
"""

import sys
from pathlib import Path

# app/utils/engine.py -> parents: utils, app, backend, <repo root>
_REPO_ROOT = Path(__file__).resolve().parents[3]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

try:
    from optimization.engine import allocation, graph, routing, wolfram

    ENGINE_AVAILABLE = True
except ImportError:  # pragma: no cover - optional dependency path
    allocation = graph = routing = wolfram = None  # type: ignore[assignment]
    ENGINE_AVAILABLE = False

__all__ = ["ENGINE_AVAILABLE", "allocation", "graph", "routing", "wolfram"]
