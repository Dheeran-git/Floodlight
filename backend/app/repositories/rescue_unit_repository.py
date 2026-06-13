"""Rescue unit repository — data access for rescue teams.

Extends BaseRepository with resource-specific queries.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.rescue_unit import RescueUnit
from app.repositories.base import BaseRepository


class RescueUnitRepository(BaseRepository[RescueUnit]):
    """Data access layer for RescueUnit entities."""

    def __init__(self, db: Session) -> None:
        super().__init__(RescueUnit, db)

    def get_available(self) -> list[RescueUnit]:
        """Retrieve all rescue units with 'available' status.

        Returns:
            List of available rescue units.
        """
        stmt = select(RescueUnit).where(RescueUnit.status == "available")
        return list(self.db.execute(stmt).scalars().all())

    def get_by_type(self, unit_type: str) -> list[RescueUnit]:
        """Retrieve rescue units filtered by type.

        Args:
            unit_type: Type of rescue unit (e.g., 'boat', 'vehicle').

        Returns:
            List of rescue units matching the type.
        """
        stmt = select(RescueUnit).where(RescueUnit.type == unit_type)
        return list(self.db.execute(stmt).scalars().all())
