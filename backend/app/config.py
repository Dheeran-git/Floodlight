"""Application settings management.

Loads configuration from environment variables with sensible defaults
for local development. Uses Pydantic BaseSettings for validation.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "Floodlight"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    # Empty string triggers SQLite fallback for local development
    DATABASE_URL: str = ""

    # AI Services
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    ELEVENLABS_API_KEY: str = ""

    # Mapping
    MAPBOX_TOKEN: str = ""

    # Wolfram
    WOLFRAM_APP_ID: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def effective_database_url(self) -> str:
        """Return the database URL, falling back to SQLite for local dev.

        Normalizes the legacy ``postgres://`` scheme that some managed hosts
        (e.g. Render, Heroku) hand out to ``postgresql://``, which SQLAlchemy
        2.x requires.
        """
        if self.DATABASE_URL:
            if self.DATABASE_URL.startswith("postgres://"):
                return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            return self.DATABASE_URL
        return "sqlite:///./floodlight_dev.db"


def get_settings() -> Settings:
    """Create and return application settings instance."""
    return Settings()
