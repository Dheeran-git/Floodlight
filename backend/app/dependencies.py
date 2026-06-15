"""Dependency injection module.

Provides factory functions for composing services with their
repository dependencies. Used by FastAPI's Depends() system.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.incident_repository import IncidentRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.rescue_unit_repository import RescueUnitRepository
from app.repositories.shelter_repository import ShelterRepository
from app.services.command_service import CommandService
from app.services.incident_service import IncidentService
from app.services.optimization_service import OptimizationService
from app.services.report_service import ReportService
from app.services.resource_service import ResourceService
from app.services.shelter_service import ShelterService


def get_report_service(db: Session = Depends(get_db)) -> ReportService:
    """Create a ReportService with its repository.

    Args:
        db: Database session.

    Returns:
        Configured ReportService instance.
    """
    return ReportService(repository=ReportRepository(db))


def get_incident_service(db: Session = Depends(get_db)) -> IncidentService:
    """Create an IncidentService with its repository.

    Args:
        db: Database session.

    Returns:
        Configured IncidentService instance.
    """
    return IncidentService(repository=IncidentRepository(db))


def get_resource_service(db: Session = Depends(get_db)) -> ResourceService:
    """Create a ResourceService with its repository.

    Args:
        db: Database session.

    Returns:
        Configured ResourceService instance.
    """
    return ResourceService(repository=RescueUnitRepository(db))


def get_shelter_service(db: Session = Depends(get_db)) -> ShelterService:
    """Create a ShelterService with its repository.

    Args:
        db: Database session.

    Returns:
        Configured ShelterService instance.
    """
    return ShelterService(repository=ShelterRepository(db))


def get_optimization_service(
    db: Session = Depends(get_db),
) -> OptimizationService:
    """Create an OptimizationService with its repository.

    Args:
        db: Database session.

    Returns:
        Configured OptimizationService instance.
    """
    return OptimizationService(db=db)


def get_command_service(db: Session = Depends(get_db)) -> CommandService:
    """Create a CommandService with a database session.

    Args:
        db: Database session.

    Returns:
        Configured CommandService instance.
    """
    return CommandService(db=db)
