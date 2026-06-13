"""Incident repository — data access for operational incidents.

Extends BaseRepository with incident-specific queries.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.repositories.base import BaseRepository


class IncidentRepository(BaseRepository[Incident]):
    """Data access layer for Incident entities."""

    def __init__(self, db: Session) -> None:
        super().__init__(Incident, db)

    def get_active(self) -> list[Incident]:
        """Retrieve all active incidents ordered by priority.

        Returns:
            List of active incidents, highest priority first.
        """
        stmt = (
            select(Incident)
            .where(Incident.status == "active")
            .order_by(Incident.priority_score.desc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_by_severity(self, severity: str) -> list[Incident]:
        """Retrieve incidents filtered by severity level.

        Args:
            severity: Severity level (P0, P1, P2, P3).

        Returns:
            List of incidents matching the severity.
        """
        stmt = select(Incident).where(Incident.severity == severity)
        return list(self.db.execute(stmt).scalars().all())
