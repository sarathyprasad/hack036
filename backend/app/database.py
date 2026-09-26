from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import BACKEND_DIR, settings

raw_url = settings.database_url.strip()

# Normalize database URL for PostgreSQL (Render provides postgres:// or postgresql://)
# SQLAlchemy 2.0 with psycopg v3 requires postgresql+psycopg://
if raw_url.startswith("postgres://"):
    url = raw_url.replace("postgres://", "postgresql+psycopg://", 1)
elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
    url = raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
elif raw_url.startswith("sqlite:///./"):
    db_path = BACKEND_DIR / raw_url.removeprefix("sqlite:///./")
    db_path.parent.mkdir(parents=True, exist_ok=True)
    url = f"sqlite:///{db_path.as_posix()}"
else:
    url = raw_url

connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
engine = create_engine(url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
