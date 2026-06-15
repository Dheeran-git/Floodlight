"""Prediction API endpoints.

- GET /prediction/risk — Forecasted risk zones for the crisis map.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.prediction import RiskZoneResponse
from app.services.prediction.escalation import PredictionService

router = APIRouter(prefix="/prediction", tags=["prediction"])


def _get_service(db: Session = Depends(get_db)) -> PredictionService:
    """Compose the prediction service with a database session."""
    return PredictionService(db=db)


@router.get("/risk", response_model=list[RiskZoneResponse])
def get_risk_zones(
    service: PredictionService = Depends(_get_service),
) -> list[RiskZoneResponse]:
    """Return forecasted risk zones derived from active incidents.

    Args:
        service: Injected prediction service.

    Returns:
        Risk zones ordered by current risk score (highest first).
    """
    zones = service.risk_zones()
    return [RiskZoneResponse.model_validate(z) for z in zones]
