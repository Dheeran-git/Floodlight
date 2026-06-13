"""Report model — raw citizen submissions.

Stores text/voice reports with GPS coordinates, severity, and credibility
as determined by AI triage.
"""

from sqlalchemy import Float, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Report(UUIDMixin, TimestampMixin, Base):
    """A citizen-submitted flood report."""

    __tablename__ = "reports"

    text: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(
        String(50), nullable=False, default="citizen_app"
    )
    severity: Mapped[str | None] = mapped_column(String(10), nullable=True)
    credibility: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )

    __table_args__ = (
        Index("ix_reports_created_at", "created_at"),
        Index("ix_reports_severity", "severity"),
        Index("ix_reports_location", "latitude", "longitude"),
    )

    def __repr__(self) -> str:
        return f"<Report id={self.id} severity={self.severity} status={self.status}>"
