"""Shelter service — business logic for emergency shelters.

Handles shelter listing and risk prediction calculations.
"""

import logging

from app.models.shelter import Shelter
from app.repositories.shelter_repository import ShelterRepository
from app.schemas.shelter import ShelterRiskResponse

logger = logging.getLogger(__name__)


class ShelterService:
    """Business logic for shelter operations."""

    def __init__(self, repository: ShelterRepository) -> None:
        self.repository = repository

    def list_shelters(
        self, limit: int = 100, offset: int = 0
    ) -> list[Shelter]:
        """Retrieve a paginated list of all shelters.

        Args:
            limit: Maximum number of shelters to return.
            offset: Number of shelters to skip.

        Returns:
            List of shelter entities.
        """
        return self.repository.get_all(limit=limit, offset=offset)

    def get_shelter_risks(self) -> list[ShelterRiskResponse]:
        """Calculate overflow probability for all shelters.

        Uses a simple occupancy ratio as a baseline risk estimate.
        Predictive escalation model will enhance this in Phase 5.

        Returns:
            List of shelter risk assessments.
        """
        shelters = self.repository.get_all()
        risks = []
        for shelter in shelters:
            if shelter.capacity > 0:
                overflow_prob = min(
                    shelter.current_occupancy / shelter.capacity, 1.0
                )
            else:
                overflow_prob = 1.0

            risks.append(
                ShelterRiskResponse(
                    name=shelter.name,
                    overflow_probability=round(overflow_prob, 2),
                )
            )

        return sorted(risks, key=lambda r: r.overflow_probability, reverse=True)
