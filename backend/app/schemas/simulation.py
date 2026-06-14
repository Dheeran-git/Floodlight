"""Simulation schemas — response models for scenario injection.

Matches POST /simulation/run.
"""

from pydantic import BaseModel


class SimulationRunResponse(BaseModel):
    """Result of running a scripted simulation scenario."""

    success: bool = True
    scenario: str
    reports_created: int
    report_ids: list[str]
