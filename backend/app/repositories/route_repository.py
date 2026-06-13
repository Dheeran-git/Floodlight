"""Route repository — data access for rescue routes.

Extends BaseRepository with route-specific queries.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.route import Route
from app.repositories.base import BaseRepository


class RouteRepository(BaseRepository[Route]):
    """Data access layer for Route entities."""

    def __init__(self, db: Session) -> None:
        super().__init__(Route, db)

    def get_by_incident(self, incident_id: uuid.UUID) -> list[Route]:
        """Retrieve all routes for a specific incident.

        Args:
            incident_id: The incident UUID to filter by.

        Returns:
            List of routes assigned to the incident.
        """
        stmt = select(Route).where(Route.incident_id == incident_id)
        return list(self.db.execute(stmt).scalars().all())

    def get_by_unit(self, unit_id: uuid.UUID) -> list[Route]:
        """Retrieve all routes for a specific rescue unit.

        Args:
            unit_id: The rescue unit UUID to filter by.

        Returns:
            List of routes assigned to the unit.
        """
        stmt = select(Route).where(Route.unit_id == unit_id)
        return list(self.db.execute(stmt).scalars().all())
