"""SQLite connection and schema management for the HashLog ledger."""
from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager

try:
    from .config import DATABASE_PATH, RAW_DATABASE_PATH
except ImportError:  # pragma: no cover - supports running from backend/.
    from config import DATABASE_PATH, RAW_DATABASE_PATH


CREATE_HASH_RECORDS_TABLE = """
CREATE TABLE IF NOT EXISTS hash_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_system TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    content_hash TEXT NOT NULL,
    entry_hash TEXT NOT NULL,
    previous_version_hash TEXT,
    previous_ledger_hash TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    metadata TEXT,
    raw_content TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_system, record_type, record_id, version_number)
)
"""

CREATE_CHECKPOINTS_TABLE = """
CREATE TABLE IF NOT EXISTS checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_record_id INTEGER NOT NULL,
    ledger_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
"""

CREATE_RAW_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS raw_logs (
    record_db_id INTEGER PRIMARY KEY,
    source_system TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    content_hash TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
"""


def get_db() -> sqlite3.Connection:
    """Open a database connection with dictionary-like rows."""
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 10000")
    return connection


def get_raw_db() -> sqlite3.Connection:
    connection = sqlite3.connect(RAW_DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA busy_timeout = 10000")
    return connection


def init_db() -> None:
    """Create the HashLog schema and lookup indexes.

    The application exposes no update/delete routes. Direct database edits are
    intentionally still possible for the tamper-detection demonstration.
    """
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAW_DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = get_db()
    try:
        connection.execute("PRAGMA journal_mode = WAL")
        connection.execute(CREATE_HASH_RECORDS_TABLE)
        columns = {row["name"] for row in connection.execute("PRAGMA table_info(hash_records)")}
        if "raw_content" not in columns:
            connection.execute("ALTER TABLE hash_records ADD COLUMN raw_content TEXT")
        connection.execute(CREATE_CHECKPOINTS_TABLE)
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_hash_records_identity "
            "ON hash_records(source_system, record_type, record_id, version_number)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_hash_records_content_hash "
            "ON hash_records(content_hash)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_hash_records_ledger_hash "
            "ON hash_records(previous_ledger_hash)"
        )
        connection.commit()
    finally:
        connection.close()
    raw_connection = get_raw_db()
    try:
        raw_connection.execute(CREATE_RAW_LOGS_TABLE)
        raw_connection.commit()
    finally:
        raw_connection.close()


@contextmanager
def db_session() -> Iterator[sqlite3.Connection]:
    """Yield a connection and commit or roll back the current transaction."""
    connection = get_db()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


@contextmanager
def raw_db_session() -> Iterator[sqlite3.Connection]:
    connection = get_raw_db()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
