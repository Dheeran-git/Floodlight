"""Real-time event broadcasting over WebSockets.

A single ``ConnectionManager`` fans out operational events to all connected
clients. REST handlers run in a threadpool (sync), so ``publish_event`` bridges
to the async broadcast via ``run_coroutine_threadsafe`` on the captured loop.
All publishing is best-effort and never raises into the request path.
"""

import asyncio
import logging
from datetime import UTC, datetime
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)

# Canonical event types emitted by the platform.
EVENT_REPORT_CREATED = "report_created"
EVENT_INCIDENT_CREATED = "incident_created"
EVENT_INCIDENT_UPDATED = "incident_updated"
EVENT_RESOURCE_ASSIGNED = "resource_assigned"
EVENT_OPTIMIZATION_COMPLETE = "optimization_complete"


class ConnectionManager:
    """Tracks active WebSocket clients and broadcasts JSON events to them."""

    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self.loop: asyncio.AbstractEventLoop | None = None

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self._connections.add(websocket)
        logger.info("WebSocket connected (%d active)", len(self._connections))

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket connection."""
        self._connections.discard(websocket)
        logger.info("WebSocket disconnected (%d active)", len(self._connections))

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Send a JSON message to all connected clients, pruning dead ones."""
        dead: list[WebSocket] = []
        for connection in self._connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for connection in dead:
            self._connections.discard(connection)


manager = ConnectionManager()


def publish_event(event_type: str, data: dict[str, Any]) -> None:
    """Broadcast an operational event to all WebSocket clients (best-effort).

    Safe to call from synchronous request handlers. No-ops if the event loop
    has not been captured yet (e.g. during tests without a running server).

    Args:
        event_type: One of the EVENT_* constants.
        data: JSON-serializable event payload.
    """
    message = {
        "type": event_type,
        "data": data,
        "timestamp": datetime.now(UTC).isoformat(),
    }
    loop = manager.loop
    if loop is None or not loop.is_running():
        return
    try:
        asyncio.run_coroutine_threadsafe(manager.broadcast(message), loop)
    except Exception as exc:
        logger.warning("Failed to publish event %s: %s", event_type, exc)
