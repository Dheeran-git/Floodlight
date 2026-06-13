"""Rescue unit model — emergency response teams and vehicles.

Tracks real-time position, status, and capacity of rescue units.
"""

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import UUIDMixin


class RescueUnit(UUIDMixin, Base):
    """A rescue team or vehicle available for deployment."""

    __tablename__ = "rescue_units"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="available"
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    routes = relationship("Route", back_populates="unit", lazy="selectin")

    def __repr__(self) -> str:
        return f"<RescueUnit id={self.id} name={self.name!r} status={self.status}>"
