from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import inspect
from core import settings


class Base(DeclarativeBase):
    pass

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema() -> None:
    """Create DB tables if they do not exist. Safe to call multiple times."""
    # Import models to register all tables with Base.metadata
    from db import models  # noqa: F401

    # Optional check: access inspector (not strictly necessary for create_all)
    _ = inspect(engine)
    Base.metadata.create_all(bind=engine)
