"""Health check endpoint.

Simple liveness probe for deployment monitoring.
Matches: GET /api/v1/health from API_SPEC.md.
"""

from fastapi import APIRouter

from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return application health status.

    Returns:
        HealthResponse with status 'healthy'.
    """
    return HealthResponse(status="healthy")
