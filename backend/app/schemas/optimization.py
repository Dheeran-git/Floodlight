"""Optimization schemas — request/response models for the optimization engine.

Matches API_SPEC.md POST /optimization/run and GET /optimization/{run_id}.
"""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class OptimizationRunResponse(BaseModel):
    """Response for triggering an optimization run.

    Matches: POST /optimization/run response.
    """

    success: bool = True
    run_id: uuid.UUID


class OptimizationResultResponse(BaseModel):
    """Response for optimization results.

    Matches: GET /optimization/{run_id} response.
    """

    id: uuid.UUID
    algorithm: str
    input_snapshot: dict[str, Any]
    result: dict[str, Any]
    deployment_plan: list[dict[str, Any]] = []
    created_at: datetime

    model_config = {"from_attributes": True}
