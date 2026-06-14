"""Command service — operational intelligence Q&A.

Retrieves the current operational picture (incidents, shelters, units), then
answers operator questions. Uses Gemini when configured, otherwise a
deterministic rule-based engine. Every answer includes reasoning.
"""

import logging

from sqlalchemy.orm import Session

from app.models.command_query import CommandQuery
from app.repositories.incident_repository import IncidentRepository
from app.repositories.rescue_unit_repository import RescueUnitRepository
from app.repositories.shelter_repository import ShelterRepository
from app.schemas.command import CommandQueryRequest
from app.services.llm import generate_text

logger = logging.getLogger(__name__)

_SYSTEM = (
    "You are Floodlight's command intelligence assistant for flood disaster "
    "operations. Answer the operator's question concisely using ONLY the "
    "operational context provided. Always explain your reasoning. If the "
    "context is insufficient, say so."
)


class CommandService:
    """Answers operational queries from live operational data."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.incidents = IncidentRepository(db)
        self.shelters = ShelterRepository(db)
        self.units = RescueUnitRepository(db)

    def process_query(self, request: CommandQueryRequest) -> str:
        """Answer an operational query and log it.

        Args:
            request: The operator's question.

        Returns:
            A reasoned answer string.
        """
        context = self._build_context()
        answer = generate_text(
            f"Operational context:\n{context}\n\nQuestion: {request.query}",
            system=_SYSTEM,
        )
        if answer is None:
            answer = self._rule_based_answer(request.query)
        self._log(request.query, answer)
        return answer

    def _build_context(self) -> str:
        """Summarize the current operational picture as plain text."""
        incidents = self.incidents.get_active()
        shelters = self.shelters.get_all(limit=100)
        units = self.units.get_all(limit=100)
        lines = ["Active incidents (priority desc):"]
        lines += [
            f"  - {i.title} | {i.severity} | priority {i.priority_score} "
            f"@ ({i.latitude:.3f},{i.longitude:.3f})"
            for i in incidents
        ] or ["  (none)"]
        lines.append("Shelters (occupancy / capacity, risk):")
        lines += [
            f"  - {s.name}: {s.current_occupancy}/{s.capacity} "
            f"({self._ratio(s):.0%}), risk {s.risk_score:.2f}"
            for s in shelters
        ] or ["  (none)"]
        lines.append("Rescue units (status):")
        lines += [f"  - {u.name} [{u.type}]: {u.status}" for u in units] or [
            "  (none)"
        ]
        return "\n".join(lines)

    def _rule_based_answer(self, query: str) -> str:
        """Answer common operational questions without an LLM."""
        lowered = query.lower()
        if "shelter" in lowered and (
            "overflow" in lowered or "full" in lowered or "capacity" in lowered
        ):
            return self._answer_shelter_overflow()
        if "team" in lowered or "unit" in lowered or "overload" in lowered:
            return self._answer_unit_load()
        if "risk" in lowered or "highest" in lowered or "worst" in lowered:
            return self._answer_highest_risk()
        return self._answer_overview()

    def _answer_highest_risk(self) -> str:
        """Identify the highest-priority active incident area."""
        incidents = self.incidents.get_active()
        if not incidents:
            return "No active incidents. Reasoning: the incident list is empty."
        top = incidents[0]
        return (
            f"Highest-risk area: '{top.title}' ({top.severity}, priority "
            f"{top.priority_score}) at ({top.latitude:.3f}, {top.longitude:.3f}). "
            f"Reasoning: it has the highest priority score among "
            f"{len(incidents)} active incidents."
        )

    def _answer_shelter_overflow(self) -> str:
        """Identify the shelter closest to overflowing."""
        shelters = self.shelters.get_all(limit=100)
        if not shelters:
            return "No shelters on record. Reasoning: the shelter list is empty."
        worst = max(shelters, key=self._ratio)
        return (
            f"Most at-risk shelter: '{worst.name}' at "
            f"{worst.current_occupancy}/{worst.capacity} "
            f"({self._ratio(worst):.0%} full), risk score {worst.risk_score:.2f}. "
            f"Reasoning: it has the highest occupancy ratio of all shelters; "
            f"redirect new arrivals to a lower-occupancy shelter."
        )

    def _answer_unit_load(self) -> str:
        """Summarize rescue unit availability."""
        units = self.units.get_all(limit=100)
        available = [u for u in units if u.status == "available"]
        busy = [u for u in units if u.status != "available"]
        return (
            f"{len(available)} of {len(units)} rescue units are available; "
            f"{len(busy)} are engaged. Reasoning: counted units by status. "
            f"Engaged: {', '.join(u.name for u in busy) or 'none'}."
        )

    def _answer_overview(self) -> str:
        """Provide a general operational summary."""
        incidents = self.incidents.get_active()
        units = self.units.get_available()
        return (
            f"{len(incidents)} active incidents; {len(units)} units available. "
            f"Reasoning: summarized live counts. Ask about 'highest risk area', "
            f"'shelter overflow', or 'unit load' for specifics."
        )

    @staticmethod
    def _ratio(shelter) -> float:
        """Occupancy ratio for a shelter (0 if capacity is 0)."""
        if not shelter.capacity:
            return 0.0
        return shelter.current_occupancy / shelter.capacity

    def _log(self, query: str, response: str) -> None:
        """Persist the query and response for audit."""
        self.db.add(CommandQuery(query=query, response=response))
        self.db.commit()
