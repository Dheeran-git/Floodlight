"""Optimization run model — records of optimization engine executions.

Stores algorithm used, input snapshot, and results as JSONB for
full auditability of optimization decisions.
"""

from typing import Any

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class OptimizationRun(UUIDMixin, TimestampMixin, Base):
    """A recorded optimization engine execution."""

    __tablename__ = "optimization_runs"

    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)
    input_snapshot: Mapped[dict[str, Any]] = mapped_column(
        JSON, nullable=False, default=dict
    )
    result: Mapped[dict[str, Any]] = mapped_column(
        JSON, nullable=False, default=dict
    )

    def __repr__(self) -> str:
        return f"<OptimizationRun id={self.id} algorithm={self.algorithm!r}>"
