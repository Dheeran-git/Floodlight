"""Command query model — operational intelligence queries.

Logs all command-layer queries and their AI-generated responses
for audit and analysis.
"""

from datetime import datetime

from sqlalchemy import DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import UUIDMixin


class CommandQuery(UUIDMixin, Base):
    """A logged operational intelligence query and response."""

    __tablename__ = "command_queries"

    query: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<CommandQuery id={self.id} query={self.query[:50]!r}>"
