"""Incident service — business logic for operational incidents.

Handles incident listing and detail retrieval. Incident fusion (merging
duplicate reports) lives in ``app.services.triage.fusion``.
"""

import logging
import uuid

from app.models.incident import Incident
from app.repositories.incident_repository import IncidentRepository

logger = logging.getLogger(__name__)


class IncidentService:
    """Business logic for incident operations."""

    def __init__(self, repository: IncidentRepository) -> None:
        self.repository = repository

    def list_incidents(
        self, limit: int = 100, offset: int = 0
    ) -> list[Incident]:
        """Retrieve a paginated list of all incidents.

        Args:
            limit: Maximum number of incidents to return.
            offset: Number of incidents to skip.

        Returns:
            List of incident entities.
        """
        return self.repository.get_all(limit=limit, offset=offset)

    def get_incident(self, incident_id: uuid.UUID) -> Incident | None:
        """Retrieve a single incident with full details.

        Args:
            incident_id: UUID of the incident.

        Returns:
            Incident with related reports if found, None otherwise.
        """
        return self.repository.get_by_id(incident_id)

    def get_active_incidents(self) -> list[Incident]:
        """Retrieve all active incidents ordered by priority.

        Returns:
            List of active incidents, highest priority first.
        """
        return self.repository.get_active()
