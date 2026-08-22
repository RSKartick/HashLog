"""Central configuration for the HashLog API."""

from pathlib import Path
import os


BACKEND_DIR = Path(__file__).resolve().parent
_database_setting = os.getenv("HASHLOG_DATABASE_PATH", "hashlog.db")
# Vercel's deployed filesystem is read-only. /tmp is writable but ephemeral;
# use an external database for durable production data.
if os.getenv("VERCEL") == "1" and "HASHLOG_DATABASE_PATH" not in os.environ:
    DATABASE_PATH = Path("/tmp/hashlog.db")
else:
    DATABASE_PATH = BACKEND_DIR / _database_setting

# Raw log snapshots live in a separate store from the cryptographic ledger.
_raw_database_setting = os.getenv("HASHLOG_RAW_DATABASE_PATH", "hashlog_raw.db")
if os.getenv("VERCEL") == "1" and "HASHLOG_RAW_DATABASE_PATH" not in os.environ:
    RAW_DATABASE_PATH = Path("/tmp/hashlog_raw.db")
else:
    RAW_DATABASE_PATH = BACKEND_DIR / _raw_database_setting


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
    """Allow the development tamper simulator by default for the demo deployment."""
    return os.getenv("HASHLOG_ENABLE_TAMPER_TEST", "true").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def signing_secret() -> str:
    """Secret used to sign downloadable audit certificates and anchors."""
    return os.getenv("HASHLOG_SIGNING_SECRET", "hashlog-local-demo-signing-secret")


def turnstile_secret_key() -> str | None:
    value = os.getenv("TURNSTILE_SECRET_KEY", "").strip()
    return value or None
