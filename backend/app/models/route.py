"""Route model — optimized rescue routes.

Links incidents to rescue units with distance and ETA information.
"""

import uuid

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Route(UUIDMixin, TimestampMixin, Base):
    """An optimized route from a rescue unit to an incident."""

    __tablename__ = "routes"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
    )
    unit_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rescue_units.id", ondelete="CASCADE"),
        nullable=False,
    )
    distance: Mapped[float] = mapped_column(Float, nullable=False)
    eta: Mapped[int] = mapped_column(Integer, nullable=False)  # minutes
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="planned"
    )

    # Relationships
    incident = relationship("Incident", back_populates="routes")
    unit = relationship("RescueUnit", back_populates="routes")

    def __repr__(self) -> str:
        return f"<Route id={self.id} eta={self.eta}min status={self.status}>"
