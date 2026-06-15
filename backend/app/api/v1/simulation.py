"""Simulation API endpoints.

- POST /simulation/run — Inject a scripted 'heavy rain' flood scenario.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.simulation import SimulationRunResponse
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulation", tags=["simulation"])


def _get_service(db: Session = Depends(get_db)) -> SimulationService:
    """Compose the simulation service with a database session."""
    return SimulationService(db=db)


@router.post("/run", response_model=SimulationRunResponse)
def run_simulation(
    service: SimulationService = Depends(_get_service),
) -> SimulationRunResponse:
    """Run the heavy-rain demo scenario through the live report pipeline.

    Args:
        service: Injected simulation service.

    Returns:
        Summary of the reports created by the scenario.
    """
    result = service.run_heavy_rain()
    return SimulationRunResponse(
        scenario=str(result["scenario"]),
        reports_created=int(result["reports_created"]),
        report_ids=list(result["report_ids"]),
    )
