"""Optimization service — wires the NetworkX/SciPy engine to operational data.

Pulls active incidents, available units, and shelters from the database, runs
flood-aware routing, min-cost unit→incident allocation, and shelter balancing
from ``optimization.engine``, persists the resulting routes, and records the run
with a fully reasoned deployment plan.
"""

import logging
import sys
import uuid
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models.optimization_run import OptimizationRun
from app.models.route import Route
from app.repositories.base import BaseRepository
from app.repositories.incident_repository import IncidentRepository
from app.repositories.rescue_unit_repository import RescueUnitRepository
from app.repositories.shelter_repository import ShelterRepository
from app.services.events import EVENT_OPTIMIZATION_COMPLETE, publish_event

logger = logging.getLogger(__name__)

# Make the monorepo's optimization package importable (PEP 420 namespace).
_REPO_ROOT = Path(__file__).resolve().parents[3]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

try:
    from optimization.engine import allocation, graph, routing

    _ENGINE_AVAILABLE = True
except ImportError as exc:  # pragma: no cover - depends on optional install
    logger.warning("Optimization engine unavailable: %s", exc)
    _ENGINE_AVAILABLE = False

_SPEED_KMH = 30.0
_FLOOD_RADIUS_KM = 0.8
_FLOOD_INTENSITY = 0.7


class OptimizationService:
    """Business logic for the optimization engine."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.runs = BaseRepository(OptimizationRun, db)
        self.incidents = IncidentRepository(db)
        self.units = RescueUnitRepository(db)
        self.shelters = ShelterRepository(db)

    def trigger_run(self) -> OptimizationRun:
        """Run the optimization engine and persist the result.

        Returns:
            The created optimization run record.
        """
        if not _ENGINE_AVAILABLE:
            return self._record_run("unavailable", {}, {"deployment_plan": []})

        incidents = self.incidents.get_active()
        units = self.units.get_available()
        shelters = self.shelters.get_all(limit=100)

        assignments = self._allocate(units, incidents)
        road_graph = self._build_graph(units, incidents, shelters)
        plan = self._build_plan(assignments, road_graph)
        self._persist_routes(assignments)
        shelter_advice = self._balance(shelters)

        result = {
            "deployment_plan": plan,
            "shelter_advice": shelter_advice,
            "summary": {
                "incidents": len(incidents),
                "available_units": len(units),
                "assignments": len(plan),
            },
        }
        snapshot = {
            "incidents": len(incidents),
            "units": len(units),
            "shelters": len(shelters),
        }
        run = self._record_run("networkx+scipy", snapshot, result)
        publish_event(
            EVENT_OPTIMIZATION_COMPLETE,
            {"run_id": str(run.id), "assignments": len(plan)},
        )
        return run

    def get_result(self, run_id: uuid.UUID) -> OptimizationRun | None:
        """Retrieve a stored optimization run by ID."""
        return self.runs.get_by_id(run_id)

    def _allocate(self, units: list, incidents: list) -> list:
        """Map ORM rows to engine inputs and run min-cost allocation."""
        unit_inputs = [
            allocation.UnitInput(
                id=str(u.id), lat=u.latitude, lon=u.longitude,
                type=u.type, capacity=u.capacity,
            )
            for u in units
        ]
        incident_inputs = [
            allocation.IncidentInput(
                id=str(i.id), lat=i.latitude, lon=i.longitude,
                severity=i.severity, priority_score=i.priority_score,
            )
            for i in incidents
        ]
        return allocation.allocate_resources(
            unit_inputs, incident_inputs, speed_kmh=_SPEED_KMH
        )

    def _build_graph(self, units: list, incidents: list, shelters: list):
        """Construct the flood-aware road graph from all entity coordinates."""
        nodes = (
            [graph.GeoNode(str(u.id), u.latitude, u.longitude, "unit") for u in units]
            + [graph.GeoNode(str(i.id), i.latitude, i.longitude, "incident")
               for i in incidents]
            + [graph.GeoNode(str(s.id), s.latitude, s.longitude, "shelter")
               for s in shelters]
        )
        flood_zones = [
            graph.FloodZone(i.latitude, i.longitude, _FLOOD_RADIUS_KM, _FLOOD_INTENSITY)
            for i in incidents
            if i.severity in {"P0", "P1"}
        ]
        return graph.build_road_graph(nodes, flood_zones=flood_zones)

    def _build_plan(self, assignments: list, road_graph) -> list[dict[str, Any]]:
        """Attach routes to each assignment to form the deployment plan."""
        plan: list[dict[str, Any]] = []
        for item in assignments:
            route = routing.find_safe_route(
                road_graph, item.unit_id, item.incident_id, speed_kmh=_SPEED_KMH
            )
            entry: dict[str, Any] = {
                "unit_id": item.unit_id,
                "incident_id": item.incident_id,
                "distance_km": round(item.distance_km, 2),
                "eta_minutes": item.eta_minutes,
                "reasoning": item.reasoning,
                "route_coordinates": route.coordinates if route else [],
                "route_safe": route.safe if route else True,
            }
            plan.append(entry)
        return plan

    def _persist_routes(self, assignments: list) -> None:
        """Store a Route row for each assignment."""
        for item in assignments:
            self.db.add(Route(
                incident_id=uuid.UUID(item.incident_id),
                unit_id=uuid.UUID(item.unit_id),
                distance=item.distance_km,
                eta=item.eta_minutes,
                status="planned",
            ))
        self.db.commit()

    def _balance(self, shelters: list) -> list[dict[str, Any]]:
        """Run shelter balancing and serialize the advice."""
        shelter_inputs = [
            allocation.ShelterInput(
                id=str(s.id), name=s.name, capacity=s.capacity,
                current_occupancy=s.current_occupancy, risk_score=s.risk_score,
            )
            for s in shelters
        ]
        advice = allocation.balance_shelters(shelter_inputs)
        return [
            {
                "shelter_id": a.shelter_id,
                "name": a.name,
                "occupancy_ratio": round(a.occupancy_ratio, 2),
                "overflow_risk": round(a.overflow_risk, 2),
                "time_to_saturation_min": a.time_to_saturation_min,
                "recommendation": a.recommendation,
            }
            for a in advice
        ]

    def _record_run(
        self, algorithm: str, snapshot: dict[str, Any], result: dict[str, Any]
    ) -> OptimizationRun:
        """Persist an optimization run record."""
        run = OptimizationRun(
            algorithm=algorithm, input_snapshot=snapshot, result=result
        )
        created = self.runs.create(run)
        logger.info("Optimization run %s (%s)", created.id, algorithm)
        return created
