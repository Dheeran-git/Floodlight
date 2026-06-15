"""Optimization API endpoints.

Matches API_SPEC.md:
- POST /optimization/run — Trigger optimization
- GET /optimization/{run_id} — Get optimization results
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.optimization import OptimizationResultResponse, OptimizationRunResponse
from app.services.optimization_service import OptimizationService

router = APIRouter(prefix="/optimization", tags=["optimization"])


def _get_service(db: Session = Depends(get_db)) -> OptimizationService:
    """Compose optimization service with its dependencies."""
    return OptimizationService(db=db)


@router.post("/run", response_model=OptimizationRunResponse)
def trigger_optimization(
    service: OptimizationService = Depends(_get_service),
) -> OptimizationRunResponse:
    """Trigger a new optimization run.

    Creates an optimization run that analyzes current incidents,
    resources, and shelters to produce a deployment plan.

    Args:
        service: Injected optimization service.

    Returns:
        Success response with the optimization run ID.
    """
    run = service.trigger_run()
    return OptimizationRunResponse(run_id=run.id)


@router.get("/{run_id}", response_model=OptimizationResultResponse)
def get_optimization_result(
    run_id: uuid.UUID,
    service: OptimizationService = Depends(_get_service),
) -> OptimizationResultResponse:
    """Retrieve results of an optimization run.

    Args:
        run_id: UUID of the optimization run.
        service: Injected optimization service.

    Returns:
        Optimization results including deployment plan.

    Raises:
        HTTPException: 404 if run not found.
    """
    run = service.get_result(run_id)
    if run is None:
        raise HTTPException(
            status_code=404, detail="Optimization run not found"
        )
    return OptimizationResultResponse(
        id=run.id,
        algorithm=run.algorithm,
        input_snapshot=run.input_snapshot,
        result=run.result,
        deployment_plan=run.result.get("deployment_plan", []),
        created_at=run.created_at,
    )
