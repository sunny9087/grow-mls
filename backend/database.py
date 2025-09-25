# backend/database.py
import os
from sqlmodel import SQLModel, create_engine
from sqlalchemy.engine.url import make_url

# read env var
raw = os.getenv("DATABASE_URL", "").strip()

# If someone accidentally included `DATABASE_URL = "..."` or surrounding quotes, clean it:
if raw.startswith("DATABASE_URL"):
    # remove anything up to the first '='
    try:
        raw = raw.split("=", 1)[1].strip()
    except Exception:
        raw = raw

# strip surrounding quotes if present
if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
    raw = raw[1:-1].strip()

# fallback to tmp sqlite for Render if still empty
if not raw:
    raw = "sqlite:////tmp/dev.db"

DATABASE_URL = raw

# choose sqlite connect args only when scheme is sqlite
connect_args = {}
try:
    url_obj = make_url(DATABASE_URL)
    if url_obj.get_backend_name() == "sqlite":
        # SQLite needs check_same_thread = False when used with multiple threads
        connect_args = {"check_same_thread": False}
except Exception:
    # if we couldn't parse, default to sqlite tmp file
    DATABASE_URL = "sqlite:////tmp/dev.db"
    connect_args = {"check_same_thread": False}

# create engine
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)
