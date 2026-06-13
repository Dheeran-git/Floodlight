"""Optimization service — business logic for the optimization engine.

Stub implementation for Phase 2. Real optimization logic using
NetworkX and Wolfram will be integrated in Phase 5.
"""

import logging
import uuid

from app.models.optimization_run import OptimizationRun
from app.repositories.base import BaseRepository

logger = logging.getLogger(__name__)


class OptimizationService:
    """Business logic for optimization engine operations."""

    def __init__(self, repository: BaseRepository[OptimizationRun]) -> None:
        self.repository = repository

    def trigger_run(self) -> OptimizationRun:
        """Trigger a new optimization run.

        Stub: Creates a placeholder run record. Real optimization
        (NetworkX graph building, Wolfram simulation) will be
        integrated in Phase 5.

        Returns:
            The created optimization run record.
        """
        run = OptimizationRun(
            algorithm="stub",
            input_snapshot={"message": "Optimization engine not yet connected"},
            result={"deployment_plan": []},
        )
        created = self.repository.create(run)
        logger.info("Optimization run triggered: id=%s", created.id)
        return created

    def get_result(self, run_id: uuid.UUID) -> OptimizationRun | None:
        """Retrieve the results of an optimization run.

        Args:
            run_id: UUID of the optimization run.

        Returns:
            OptimizationRun if found, None otherwise.
        """
        return self.repository.get_by_id(run_id)
