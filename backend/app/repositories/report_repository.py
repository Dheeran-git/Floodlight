"""Report repository — data access for citizen reports.

Extends BaseRepository with report-specific queries.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report
from app.repositories.base import BaseRepository


class ReportRepository(BaseRepository[Report]):
    """Data access layer for Report entities."""

    def __init__(self, db: Session) -> None:
        super().__init__(Report, db)

    def get_by_severity(self, severity: str) -> list[Report]:
        """Retrieve reports filtered by severity level.

        Args:
            severity: Severity level (P0, P1, P2, P3).

        Returns:
            List of reports matching the severity.
        """
        stmt = select(Report).where(Report.severity == severity)
        return list(self.db.execute(stmt).scalars().all())

    def get_pending(self) -> list[Report]:
        """Retrieve all reports with 'pending' status.

        Returns:
            List of pending reports awaiting triage.
        """
        stmt = select(Report).where(Report.status == "pending")
        return list(self.db.execute(stmt).scalars().all())
