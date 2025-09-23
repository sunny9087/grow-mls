import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Force load from a specific .env file inside backend folder
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path, override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# Debug print: confirm which DB URL is active
print(">> Using DATABASE_URL =", DATABASE_URL)

# Only needed for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def get_session():
    with Session(engine) as session:
        yield session
