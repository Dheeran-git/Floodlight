"""Shelter model — emergency shelter facilities.

Tracks capacity, current occupancy, and risk scoring for shelters.
"""

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import UUIDMixin


class Shelter(UUIDMixin, Base):
    """An emergency shelter with capacity tracking."""

    __tablename__ = "shelters"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_occupancy: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    risk_score: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0
    )

    def __repr__(self) -> str:
        return (
            f"<Shelter id={self.id} name={self.name!r} "
            f"occupancy={self.current_occupancy}/{self.capacity}>"
        )
