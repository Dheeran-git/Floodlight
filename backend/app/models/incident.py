"""Incident model — merged operational incidents.

Incidents are created by fusing multiple citizen reports that describe
the same event. Includes the many-to-many association with reports.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class IncidentReport(Base):
    """Many-to-many association between incidents and reports."""

    __tablename__ = "incident_reports"

    incident_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"),
        primary_key=True,
    )


class Incident(UUIDMixin, TimestampMixin, Base):
    """A merged operational incident derived from citizen reports."""

    __tablename__ = "incidents"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(10), nullable=False)
    priority_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationships
    reports = relationship(
        "Report",
        secondary="incident_reports",
        backref="incidents",
        lazy="selectin",
    )
    routes = relationship("Route", back_populates="incident", lazy="selectin")

    __table_args__ = (
        Index("ix_incidents_severity", "severity"),
        Index("ix_incidents_priority_score", "priority_score"),
        Index("ix_incidents_location", "latitude", "longitude"),
    )

    def __repr__(self) -> str:
        return f"<Incident id={self.id} title={self.title!r} severity={self.severity}>"
