"""Simulation service — inject a scripted 'heavy rain' flood scenario.

Drives the full live pipeline (triage → fusion → events) by submitting a
sequence of escalating citizen reports across Bengaluru, so a demo or test can
watch incidents, optimization inputs, and WebSocket events appear in real time.
"""

import logging

from sqlalchemy.orm import Session

from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate
from app.services.report_service import ReportService

logger = logging.getLogger(__name__)

# Scripted scenario: (text, latitude, longitude). Ordered from informational to
# life-threatening to mimic a worsening flood event.
_HEAVY_RAIN_SCENARIO: list[tuple[str, float, float]] = [
    ("Water accumulating on the road near Bellandur, traffic slowing.",
     12.9260, 77.6780),
    ("Drain overflowing on HSR Layout service road, ankle-deep water.",
     12.9120, 77.6450),
    ("Underpass at Marathahalli flooding fast, vehicles starting to stall.",
     12.9548, 77.6998),
    ("Ground-floor homes flooding near Marathahalli bridge, water rising.",
     12.9555, 77.7015),
    ("Elderly couple stranded on first floor in Whitefield, water at the stairs.",
     12.9688, 77.7480),
    ("Family trapped on rooftop near Whitefield, water at the second floor.",
     12.9698, 77.7500),
    ("Person clinging to a submerged car roof on Whitefield Main Road, drowning risk.",
     12.9710, 77.7520),
]


class SimulationService:
    """Runs scripted disaster scenarios through the live report pipeline."""

    def __init__(self, db: Session) -> None:
        self.report_service = ReportService(repository=ReportRepository(db))

    def run_heavy_rain(self) -> dict[str, object]:
        """Submit the heavy-rain scenario reports through the full pipeline.

        Each report is triaged, fused into an incident, and broadcast over
        WebSockets exactly as a real citizen submission would be.

        Returns:
            A summary with the number of reports created and their IDs.
        """
        report_ids: list[str] = []
        for text, lat, lon in _HEAVY_RAIN_SCENARIO:
            report = self.report_service.create_report(
                ReportCreate(text=text, latitude=lat, longitude=lon,
                             source="simulation")
            )
            report_ids.append(str(report.id))
        logger.info("Heavy-rain simulation created %d reports", len(report_ids))
        return {
            "scenario": "heavy_rain",
            "reports_created": len(report_ids),
            "report_ids": report_ids,
        }
