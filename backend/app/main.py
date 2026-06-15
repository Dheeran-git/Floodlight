"""Floodlight FastAPI application entry point.

Creates and configures the FastAPI application with:
- CORS middleware
- API v1 routes
- Database table creation on startup
- Structured logging
"""

import asyncio
import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import get_settings
from app.database import Base, engine
from app.services.events import manager

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events.

    Startup: Creates database tables if they don't exist.
    Shutdown: Cleanup resources.
    """
    # Startup
    logger.info("Starting %s...", settings.APP_NAME)
    logger.info("Environment: %s", settings.ENVIRONMENT)
    logger.info("Database: %s", settings.effective_database_url[:30] + "...")

    # Create tables (for development; use Alembic migrations in production)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified.")

    # Capture the running loop so sync handlers can broadcast WebSocket events.
    manager.loop = asyncio.get_running_loop()

    yield

    # Shutdown
    logger.info("Shutting down %s...", settings.APP_NAME)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance.
    """
    application = FastAPI(
        title=settings.APP_NAME,
        description=(
            "AI-powered Disaster Operations Copilot for urban flood response. "
            "Transforms citizen reports into actionable intelligence."
        ),
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API v1 routes
    application.include_router(
        api_router,
        prefix=settings.API_V1_PREFIX,
    )

    return application


# Application instance used by uvicorn
app = create_app()
