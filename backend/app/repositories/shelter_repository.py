"""Shelter repository — data access for emergency shelters.

Extends BaseRepository with shelter-specific queries.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.shelter import Shelter
from app.repositories.base import BaseRepository


class ShelterRepository(BaseRepository[Shelter]):
    """Data access layer for Shelter entities."""

    def __init__(self, db: Session) -> None:
        super().__init__(Shelter, db)

    def get_with_capacity(self) -> list[Shelter]:
        """Retrieve shelters that still have available capacity.

        Returns:
            List of shelters where current_occupancy < capacity.
        """
        stmt = select(Shelter).where(
            Shelter.current_occupancy < Shelter.capacity
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_high_risk(self, threshold: float = 0.7) -> list[Shelter]:
        """Retrieve shelters with risk score above threshold.

        Args:
            threshold: Minimum risk score to filter by.

        Returns:
            List of high-risk shelters.
        """
        stmt = (
            select(Shelter)
            .where(Shelter.risk_score >= threshold)
            .order_by(Shelter.risk_score.desc())
        )
        return list(self.db.execute(stmt).scalars().all())
