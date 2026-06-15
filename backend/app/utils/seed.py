"""Seed the database with a realistic Bengaluru flood scenario.

Populates shelters, rescue units, citizen reports, and fused incidents so
the API returns meaningful data during development and demos.

Run from the ``backend/`` directory::

    python -m app.utils.seed

The script is idempotent: it clears the seeded tables before inserting, so
repeated runs leave the database in the same state.
"""

import logging

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.incident import Incident, IncidentReport
from app.models.report import Report
from app.models.rescue_unit import RescueUnit
from app.models.route import Route
from app.models.shelter import Shelter

logger = logging.getLogger(__name__)


def _clear(db: Session) -> None:
    """Remove existing seeded rows in foreign-key-safe order."""
    db.query(Route).delete()
    db.query(IncidentReport).delete()
    db.query(Incident).delete()
    db.query(Report).delete()
    db.query(RescueUnit).delete()
    db.query(Shelter).delete()
    db.commit()


def _seed_shelters(db: Session) -> None:
    """Insert emergency shelters at real Bengaluru locations."""
    shelters = [
        Shelter(name="Whitefield Community Hall", capacity=300,
                current_occupancy=275, latitude=12.9698, longitude=77.7500,
                risk_score=0.92),
        Shelter(name="Marathahalli Indoor Stadium", capacity=500,
                current_occupancy=210, latitude=12.9560, longitude=77.7010,
                risk_score=0.42),
        Shelter(name="Koramangala Indoor Stadium", capacity=400,
                current_occupancy=180, latitude=12.9352, longitude=77.6245,
                risk_score=0.45),
        Shelter(name="Electronic City Convention Center", capacity=600,
                current_occupancy=120, latitude=12.8452, longitude=77.6602,
                risk_score=0.20),
        Shelter(name="Yelahanka Air Force Ground", capacity=800,
                current_occupancy=95, latitude=13.1007, longitude=77.5963,
                risk_score=0.12),
        Shelter(name="Jayanagar Community Complex", capacity=250,
                current_occupancy=240, latitude=12.9250, longitude=77.5938,
                risk_score=0.96),
        Shelter(name="Hebbal Town Hall", capacity=350,
                current_occupancy=160, latitude=13.0358, longitude=77.5970,
                risk_score=0.46),
    ]
    db.add_all(shelters)
    db.commit()


def _seed_units(db: Session) -> None:
    """Insert rescue units (boats, vehicles, medical teams)."""
    units = [
        RescueUnit(name="Boat Team Alpha", type="boat", status="available",
                   latitude=12.9580, longitude=77.7040, capacity=6),
        RescueUnit(name="Boat Team Bravo", type="boat", status="en_route",
                   latitude=12.9700, longitude=77.7350, capacity=6),
        RescueUnit(name="Rescue Vehicle 1", type="vehicle", status="available",
                   latitude=12.9352, longitude=77.6100, capacity=8),
        RescueUnit(name="Rescue Vehicle 2", type="vehicle", status="assigned",
                   latitude=12.9280, longitude=77.5950, capacity=8),
        RescueUnit(name="Medical Team Red", type="medical_team",
                   status="available", latitude=12.9700, longitude=77.6400,
                   capacity=4),
        RescueUnit(name="Medical Team Blue", type="medical_team",
                   status="available", latitude=13.0300, longitude=77.5980,
                   capacity=4),
    ]
    db.add_all(units)
    db.commit()


def _seed_reports(db: Session) -> list[Report]:
    """Insert citizen reports across the city and return them."""
    reports = [
        Report(text="Family trapped on rooftop near Whitefield, water rising fast.",
               latitude=12.9695, longitude=77.7495, severity="P0",
               credibility=5, status="merged"),
        Report(text="Two people on a submerged car roof on Whitefield Main Road.",
               latitude=12.9710, longitude=77.7520, severity="P0",
               credibility=4, status="merged"),
        Report(text="Elderly man stranded, can't reach upper floor in Whitefield.",
               latitude=12.9688, longitude=77.7480, severity="P1",
               credibility=4, status="merged"),
        Report(text="Water entering ground-floor homes near Marathahalli bridge.",
               latitude=12.9555, longitude=77.7015, severity="P1",
               credibility=4, status="merged"),
        Report(text="Underpass at Marathahalli fully flooded, vehicles stuck.",
               latitude=12.9548, longitude=77.6998, severity="P2",
               credibility=5, status="merged"),
        Report(text="Storm drain overflow flooding Jayanagar 4th block lanes.",
               latitude=12.9252, longitude=77.5935, severity="P1",
               credibility=3, status="merged"),
        Report(text="Knee-deep water spreading across Jayanagar market street.",
               latitude=12.9245, longitude=77.5942, severity="P2",
               credibility=4, status="merged"),
        Report(text="Koramangala 6th block road blocked by fallen tree and water.",
               latitude=12.9350, longitude=77.6240, severity="P2",
               credibility=4, status="triaged"),
        Report(text="Basement parking flooding in Koramangala, cars submerging.",
               latitude=12.9360, longitude=77.6255, severity="P2",
               credibility=3, status="triaged"),
        Report(text="Minor waterlogging near Hebbal flyover, traffic slow.",
               latitude=13.0355, longitude=77.5975, severity="P3",
               credibility=3, status="pending"),
        Report(text="Drain water accumulating on HSR Layout service road.",
               latitude=12.9120, longitude=77.6450, severity="P3",
               credibility=2, status="pending"),
        Report(text="Power line down in waterlogged street, Electronic City phase 1.",
               latitude=12.8455, longitude=77.6605, severity="P1",
               credibility=4, status="triaged"),
        Report(text="Pregnant woman needs evacuation, road cut off in Bellandur.",
               latitude=12.9260, longitude=77.6780, severity="P0",
               credibility=5, status="pending"),
        Report(text="Cattle stuck in floodwater near Yelahanka lake bund.",
               latitude=13.1010, longitude=77.5960, severity="P3",
               credibility=2, status="pending"),
        Report(text="Manhole overflowing, sewage mixing with floodwater in BTM.",
               latitude=12.9166, longitude=77.6101, severity="P2",
               credibility=3, status="pending"),
    ]
    db.add_all(reports)
    db.commit()
    return reports


def _seed_incidents(db: Session, reports: list[Report]) -> None:
    """Create fused incidents and link their source reports."""
    incidents = [
        Incident(title="Whitefield rooftop rescues",
                 description="Multiple residents trapped by rapidly rising "
                 "water near Whitefield Main Road.",
                 severity="P0", priority_score=95, status="active",
                 latitude=12.9698, longitude=77.7500),
        Incident(title="Marathahalli underpass flooding",
                 description="Underpass and nearby homes flooded; vehicles "
                 "stranded at Marathahalli bridge.",
                 severity="P1", priority_score=78, status="active",
                 latitude=12.9552, longitude=77.7008),
        Incident(title="Jayanagar drain overflow",
                 description="Storm drain overflow flooding 4th block lanes "
                 "and the market street.",
                 severity="P1", priority_score=72, status="active",
                 latitude=12.9249, longitude=77.5938),
        Incident(title="Koramangala road blockage",
                 description="Road blocked by fallen tree and basement "
                 "flooding in Koramangala 6th block.",
                 severity="P2", priority_score=55, status="active",
                 latitude=12.9355, longitude=77.6248),
    ]
    db.add_all(incidents)
    db.commit()

    # Link reports to incidents by their order in the seeded list.
    links = {0: (0, 1, 2), 1: (3, 4), 2: (5, 6), 3: (7, 8)}
    for incident_idx, report_idxs in links.items():
        for report_idx in report_idxs:
            db.add(IncidentReport(
                incident_id=incidents[incident_idx].id,
                report_id=reports[report_idx].id,
            ))
    db.commit()


def seed() -> None:
    """Clear and repopulate the database with the demo scenario."""
    db = SessionLocal()
    try:
        _clear(db)
        _seed_shelters(db)
        _seed_units(db)
        reports = _seed_reports(db)
        _seed_incidents(db, reports)
        logger.info("Seed complete: 7 shelters, 6 units, 15 reports, 4 incidents.")
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    seed()
    print("Database seeded with Bengaluru flood scenario.")
