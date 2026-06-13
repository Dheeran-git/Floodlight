"""Pytest configuration and shared fixtures.

Provides a test database session and FastAPI test client
using an in-memory SQLite database.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app

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
