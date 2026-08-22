"""Central configuration for the HashLog API."""

from pathlib import Path
import os


BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BACKEND_DIR / os.getenv("HASHLOG_DATABASE_PATH", "hashlog.db")


def cors_origins() -> list[str]:
    """Return explicitly configured browser origins for CORS."""
    raw_origins = os.getenv("HASHLOG_CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
