from datetime import timedelta
from typing import Optional
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ENV_PATH), case_sensitive=False, extra="ignore")
    PORT: int = 3000
    # Prefer a single DATABASE_URL; keep DB_* for backward compatibility
    DATABASE_URL: Optional[str] = None
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "postgres"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    JWT_SECRET_KEY: str = "changeme"
    JWT_EXPIRATION: int = 3600
    BCRYPT_SALT: int = 12
    STRIPE_SECRET_KEY: Optional[str] = None

    @property
    def database_url(self) -> str:
        """Return a SQLAlchemy URL, preferring DATABASE_URL; ensure psycopg driver is specified."""
        url = self.DATABASE_URL
        if not url:
            url = (
                f"postgresql+psycopg://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            )
        # If user provided a generic postgresql:// URL, upgrade to psycopg driver
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and "+" not in url.split("://", 1)[1]:
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def access_token_expires(self) -> timedelta:
        return timedelta(seconds=self.JWT_EXPIRATION)


settings = Settings()
