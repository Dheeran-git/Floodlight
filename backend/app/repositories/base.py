"""Base repository with generic CRUD operations.

Provides reusable data access methods that specific repositories
extend. Keeps SQLAlchemy session logic in one place.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base


class BaseRepository[ModelType: Base]:
    """Generic repository providing standard CRUD operations.

    Attributes:
        model: The SQLAlchemy model class this repository manages.
        db: The database session.
    """

    def __init__(self, model: type[ModelType], db: Session) -> None:
        self.model = model
        self.db = db

    def get_by_id(self, entity_id: uuid.UUID) -> ModelType | None:
        """Retrieve a single entity by its UUID primary key.

        Args:
            entity_id: The UUID of the entity to retrieve.

        Returns:
            The entity if found, None otherwise.
        """
        stmt = select(self.model).where(self.model.id == entity_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(self, limit: int = 100, offset: int = 0) -> list[ModelType]:
        """Retrieve all entities with pagination.

        Args:
            limit: Maximum number of entities to return.
            offset: Number of entities to skip.

        Returns:
            List of entities.
        """
        stmt = select(self.model).limit(limit).offset(offset)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, entity: ModelType) -> ModelType:
        """Persist a new entity to the database.

        Args:
            entity: The entity instance to create.

        Returns:
            The persisted entity with generated fields populated.
        """
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def update(self, entity: ModelType) -> ModelType:
        """Update an existing entity.

        Args:
            entity: The entity instance with updated fields.

        Returns:
            The updated entity.
        """
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, entity_id: uuid.UUID) -> bool:
        """Delete an entity by its UUID.

        Args:
            entity_id: The UUID of the entity to delete.

        Returns:
            True if the entity was deleted, False if not found.
        """
        entity = self.get_by_id(entity_id)
        if entity is None:
            return False
        self.db.delete(entity)
        self.db.commit()
        return True
