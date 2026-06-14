"""V1 API router aggregator.

Includes all v1 endpoint routers into a single router
that gets mounted in the main application.
"""

from fastapi import APIRouter

from app.api.v1.command import router as command_router
from app.api.v1.health import router as health_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.optimization import router as optimization_router
from app.api.v1.prediction import router as prediction_router
from app.api.v1.reports import router as reports_router
from app.api.v1.resources import router as resources_router
from app.api.v1.shelters import router as shelters_router
from app.api.v1.websocket import router as websocket_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(reports_router)
api_router.include_router(incidents_router)
api_router.include_router(resources_router)
api_router.include_router(shelters_router)
api_router.include_router(optimization_router)
api_router.include_router(prediction_router)
api_router.include_router(command_router)
api_router.include_router(websocket_router)
