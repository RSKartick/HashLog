"""Central configuration for the HashLog API."""

from pathlib import Path
import os


BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BACKEND_DIR / os.getenv("HASHLOG_DATABASE_PATH", "hashlog.db")


def cors_origins() -> list[str]:
    """Return explicitly configured browser origins for CORS."""
    raw_origins = os.getenv("HASHLOG_CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


def api_key() -> str | None:
    """Return the optional API key used to protect deployed environments."""
    value = os.getenv("HASHLOG_API_KEY", "").strip()
    return value or None


def rate_limit_per_minute() -> int:
    """Return the per-client request limit for this API process."""
    try:
        return max(1, int(os.getenv("HASHLOG_RATE_LIMIT_PER_MINUTE", "120")))
    except ValueError:
        return 120


def tamper_test_enabled() -> bool:
    """Allow the local development-only tamper simulator by default."""
    return os.getenv("HASHLOG_ENABLE_TAMPER_TEST", "true").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
