"""Shelters API endpoints.

Matches API_SPEC.md:
- GET /shelters — List all shelters
- GET /shelters/risk — Get shelter risk predictions
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.shelter_repository import ShelterRepository
from app.schemas.shelter import ShelterResponse, ShelterRiskResponse
from app.services.shelter_service import ShelterService

router = APIRouter(prefix="/shelters", tags=["shelters"])


def _get_service(db: Session = Depends(get_db)) -> ShelterService:
    """Compose shelter service with its dependencies."""
    return ShelterService(repository=ShelterRepository(db))


@router.get("", response_model=list[ShelterResponse])
def list_shelters(
    limit: int = 100,
    offset: int = 0,
    service: ShelterService = Depends(_get_service),
) -> list[ShelterResponse]:
    """Retrieve a paginated list of all shelters.

    Args:
        limit: Maximum number of shelters to return.
        offset: Number of shelters to skip.
        service: Injected shelter service.

    Returns:
        List of shelter objects with capacity information.
    """
    shelters = service.list_shelters(limit=limit, offset=offset)
    return [ShelterResponse.model_validate(s) for s in shelters]


@router.get("/risk", response_model=list[ShelterRiskResponse])
def get_shelter_risks(
    service: ShelterService = Depends(_get_service),
) -> list[ShelterRiskResponse]:
    """Get overflow risk predictions for all shelters.

    Returns shelters sorted by overflow probability (highest first).

    Args:
        service: Injected shelter service.

    Returns:
        List of shelter risk assessments.
    """
    return service.get_shelter_risks()
