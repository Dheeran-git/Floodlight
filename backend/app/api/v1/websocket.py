"""WebSocket endpoint for real-time operational updates.

Clients connect to ``/api/v1/ws`` and receive broadcast events
(report_created, incident_created/updated, resource_assigned,
optimization_complete) as JSON messages.
"""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.events import manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def operations_feed(websocket: WebSocket) -> None:
    """Stream real-time operational events to a connected client.

    The server only pushes events; inbound messages are read solely to detect
    disconnection.
    """
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as exc:
        logger.warning("WebSocket error: %s", exc)
        manager.disconnect(websocket)
