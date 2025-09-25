# backend/database.py
import os
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.engine.url import make_url

# Read env var
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# Clean accidental quotes
if (DATABASE_URL.startswith('"') and DATABASE_URL.endswith('"')) or (
    DATABASE_URL.startswith("'") and DATABASE_URL.endswith("'")
):
    DATABASE_URL = DATABASE_URL[1:-1].strip()

# Default to /tmp for Render if empty
if not DATABASE_URL:
    DATABASE_URL = "sqlite:////tmp/dev.db"

# SQLite connect args
connect_args = {}
try:
    url_obj = make_url(DATABASE_URL)
    if url_obj.get_backend_name() == "sqlite":
        connect_args = {"check_same_thread": False}
except Exception:
    DATABASE_URL = "sqlite:////tmp/dev.db"
    connect_args = {"check_same_thread": False}

# Create engine
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)

# Init database
def init_db():
    SQLModel.metadata.create_all(engine)

# ✅ Add get_session so main.py import works
def get_session():
    with Session(engine) as session:
        yield session
