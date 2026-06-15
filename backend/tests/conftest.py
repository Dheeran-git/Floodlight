"""Pytest configuration and shared fixtures.

Provides a test database session and FastAPI test client
using an in-memory SQLite database.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Force settings override for tests BEFORE importing database or main app
import app.config

_original_get_settings = app.config.get_settings

def _mock_get_settings():
    settings = _original_get_settings()
    settings.DATABASE_URL = ""
    settings.GEMINI_API_KEY = ""
    settings.ELEVENLABS_API_KEY = ""
    return settings

app.config.get_settings = _mock_get_settings

from app.database import Base, get_db
from app.main import app
from app.models.incident import Incident, IncidentReport
from app.models.report import Report
from app.models.rescue_unit import RescueUnit
from app.models.shelter import Shelter

# In-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test_floodlight.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(
    bind=test_engine,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(autouse=True)
def setup_database():
    """Create and drop all tables for each test."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Session:  # type: ignore[misc]
    """Provide a clean database session for tests.

    Yields:
        SQLAlchemy session connected to the test database.
    """
    session = TestSessionLocal()
    try:
        yield session  # type: ignore[misc]
    finally:
        session.close()


@pytest.fixture
def client(db_session: Session) -> TestClient:
    """Provide a FastAPI test client with overridden database.

    Args:
        db_session: Test database session fixture.

    Yields:
        TestClient configured to use the test database.
    """

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _make_shelters() -> list[Shelter]:
    """Build the Bengaluru demo shelters (mirrors app.utils.seed)."""
    return [
        Shelter(name="Whitefield Community Hall", capacity=300,
                current_occupancy=275, latitude=12.9698, longitude=77.7500,
                risk_score=0.92),
        Shelter(name="Marathahalli Indoor Stadium", capacity=500,
                current_occupancy=210, latitude=12.9560, longitude=77.7010,
                risk_score=0.42),
        Shelter(name="Koramangala Indoor Stadium", capacity=400,
                current_occupancy=180, latitude=12.9352, longitude=77.6245,
                risk_score=0.45),
        Shelter(name="Jayanagar Community Complex", capacity=250,
                current_occupancy=240, latitude=12.9250, longitude=77.5938,
                risk_score=0.96),
        Shelter(name="Hebbal Town Hall", capacity=350,
                current_occupancy=160, latitude=13.0358, longitude=77.5970,
                risk_score=0.46),
    ]


def _make_units() -> list[RescueUnit]:
    """Build the demo rescue units (mirrors app.utils.seed)."""
    return [
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
    ]


def _make_incidents() -> list[Incident]:
    """Build active demo incidents (mirrors app.utils.seed)."""
    return [
        Incident(title="Whitefield rooftop rescues",
                 description="Multiple residents trapped by rising water.",
                 severity="P0", priority_score=95, status="active",
                 latitude=12.9698, longitude=77.7500),
        Incident(title="Marathahalli underpass flooding",
                 description="Underpass and nearby homes flooded.",
                 severity="P1", priority_score=78, status="active",
                 latitude=12.9552, longitude=77.7008),
        Incident(title="Jayanagar drain overflow",
                 description="Storm drain overflow flooding 4th block lanes.",
                 severity="P1", priority_score=72, status="active",
                 latitude=12.9249, longitude=77.5938),
        Incident(title="Koramangala road blockage",
                 description="Road blocked by fallen tree and flooding.",
                 severity="P2", priority_score=55, status="active",
                 latitude=12.9355, longitude=77.6248),
    ]


@pytest.fixture
def seeded_db(db_session: Session) -> Session:
    """Populate the test database with shelters, units, and active incidents.

    Mirrors the production seed data but commits against the test session so
    the same connection the API uses sees the rows.

    Args:
        db_session: Test database session fixture.

    Returns:
        The same session, now populated with demo data.
    """
    db_session.add_all(_make_shelters())
    db_session.add_all(_make_units())
    db_session.add_all(_make_incidents())
    db_session.commit()
    return db_session


@pytest.fixture
def seeded_client(client: TestClient, seeded_db: Session) -> TestClient:
    """A TestClient backed by the seeded database session."""
    return client


def link_report(db: Session, incident: Incident, report: Report) -> None:
    """Associate a report with an incident in the test database."""
    db.add(IncidentReport(incident_id=incident.id, report_id=report.id))
    db.commit()
