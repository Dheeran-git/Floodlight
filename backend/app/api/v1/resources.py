"""Resources API endpoints.

Matches API_SPEC.md:
- GET /resources — List rescue units
- POST /resources/assign — Assign resource to incident
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.rescue_unit_repository import RescueUnitRepository
from app.schemas.rescue_unit import (
    RescueUnitResponse,
    ResourceAssignRequest,
    ResourceAssignResponse,
)
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["resources"])


def _get_service(db: Session = Depends(get_db)) -> ResourceService:
    """Compose resource service with its dependencies."""
    return ResourceService(repository=RescueUnitRepository(db))


@router.get("", response_model=list[RescueUnitResponse])
def list_resources(
    limit: int = 100,
    offset: int = 0,
    service: ResourceService = Depends(_get_service),
) -> list[RescueUnitResponse]:
    """Retrieve a paginated list of all rescue units.

    Args:
        limit: Maximum number of units to return.
        offset: Number of units to skip.
        service: Injected resource service.

    Returns:
        List of rescue unit objects.
    """
    units = service.list_resources(limit=limit, offset=offset)
    return [RescueUnitResponse.model_validate(u) for u in units]


@router.post("/assign", response_model=ResourceAssignResponse)
def assign_resource(
    data: ResourceAssignRequest,
    service: ResourceService = Depends(_get_service),
) -> ResourceAssignResponse:
    """Assign a rescue unit to an incident.

    Args:
        data: Assignment payload with resource_id and incident_id.
        service: Injected resource service.

    Returns:
        Success response.

    Raises:
        HTTPException: 404 if resource not found.
    """
    success = service.assign_resource(data.resource_id, data.incident_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource not found")
    return ResourceAssignResponse(success=True)
