"""Database connection and session management.

Provides SQLAlchemy engine, session factory, and declarative base.
Supports PostgreSQL for production and SQLite for local development.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all models."""

    pass


settings = get_settings()

# Configure engine based on database URL
_db_url = settings.effective_database_url
_connect_args: dict = {}

if _db_url.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine = create_engine(
    _db_url,
    echo=settings.DEBUG,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


def get_db() -> Session:  # type: ignore[misc]
    """Yield a database session for dependency injection.

    Ensures the session is properly closed after use.

    Yields:
        Session: SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db  # type: ignore[misc]
    finally:
        db.close()
