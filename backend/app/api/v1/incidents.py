"""Incidents API endpoints.

Matches API_SPEC.md:
- GET /incidents — List all incidents
- GET /incidents/{id} — Get incident details
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.incident_repository import IncidentRepository
from app.schemas.incident import IncidentDetail, IncidentResponse
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/incidents", tags=["incidents"])


def _get_service(db: Session = Depends(get_db)) -> IncidentService:
    """Compose incident service with its dependencies."""
    return IncidentService(repository=IncidentRepository(db))


@router.get("", response_model=list[IncidentResponse])
def list_incidents(
    limit: int = 100,
    offset: int = 0,
    service: IncidentService = Depends(_get_service),
) -> list[IncidentResponse]:
    """Retrieve a paginated list of all incidents.

    Args:
        limit: Maximum number of incidents to return.
        offset: Number of incidents to skip.
        service: Injected incident service.

    Returns:
        List of incident summary objects.
    """
    incidents = service.list_incidents(limit=limit, offset=offset)
    return [IncidentResponse.model_validate(i) for i in incidents]


@router.get("/{incident_id}", response_model=IncidentDetail)
def get_incident(
    incident_id: uuid.UUID,
    service: IncidentService = Depends(_get_service),
) -> IncidentDetail:
    """Retrieve detailed information for a specific incident.

    Args:
        incident_id: UUID of the incident to retrieve.
        service: Injected incident service.

    Returns:
        Detailed incident object with related reports.

    Raises:
        HTTPException: 404 if incident not found.
    """
    incident = service.get_incident(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentDetail.model_validate(incident)
