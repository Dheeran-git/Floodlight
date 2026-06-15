"""Alembic migration environment for Floodlight.

Wires Alembic to the application's SQLAlchemy metadata and settings so
``--autogenerate`` sees every model and migrations run against the same
database the app uses (PostgreSQL, or the SQLite fallback for local dev).
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

# Import the models package so every table is registered on Base.metadata.
import app.models  # noqa: F401
from alembic import context
from app.config import get_settings
from app.database import Base

# Alembic Config object — provides access to values in alembic.ini.
config = context.config

# Use the application's effective database URL (honours the SQLite fallback)
# instead of the static value in alembic.ini.
config.set_main_option("sqlalchemy.url", get_settings().effective_database_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for 'autogenerate' support.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emit SQL without a live connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode against a live database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
