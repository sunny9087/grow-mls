# backend/database.py
import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Load backend/.env if present
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path, override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/dev.db")
print(">> Using DATABASE_URL =", DATABASE_URL)

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# create engine (echo=True optional for debug)
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)


def init_db() -> None:
    """
    Create tables. Call once at startup (inside FastAPI startup event).
    Avoid calling this at import time to prevent SQLModel/SQLAlchemy
    double-registration issues during reload.
    """
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    FastAPI dependency: use `Depends(get_session)` in endpoints.
    Yields a session and closes it automatically.
    """
    with Session(engine) as session:
        yield session
