"""Resource service — business logic for rescue unit management.

Handles resource listing and assignment to incidents.
"""

import logging
import uuid

from app.models.rescue_unit import RescueUnit
from app.repositories.rescue_unit_repository import RescueUnitRepository

logger = logging.getLogger(__name__)


class ResourceService:
    """Business logic for rescue unit operations."""

    def __init__(self, repository: RescueUnitRepository) -> None:
        self.repository = repository

    def list_resources(
        self, limit: int = 100, offset: int = 0
    ) -> list[RescueUnit]:
        """Retrieve a paginated list of all rescue units.

        Args:
            limit: Maximum number of units to return.
            offset: Number of units to skip.

        Returns:
            List of rescue unit entities.
        """
        return self.repository.get_all(limit=limit, offset=offset)

    def assign_resource(
        self, resource_id: uuid.UUID, incident_id: uuid.UUID
    ) -> bool:
        """Assign a rescue unit to an incident.

        Updates the unit's status to 'assigned'. Route generation
        will be handled by the optimization engine in Phase 5.

        Args:
            resource_id: UUID of the rescue unit.
            incident_id: UUID of the incident.

        Returns:
            True if assignment succeeded, False if unit not found.
        """
        unit = self.repository.get_by_id(resource_id)
        if unit is None:
            return False

        unit.status = "assigned"
        self.repository.update(unit)
        logger.info(
            "Resource %s assigned to incident %s",
            resource_id,
            incident_id,
        )
        return True
