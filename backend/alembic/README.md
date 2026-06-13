# Alembic Migrations

Database migrations will be configured here using Alembic.

To initialize:
```bash
alembic init alembic
```

For MVP development, tables are auto-created via `Base.metadata.create_all()`.
Alembic migrations should be used when deploying to production.
