"""this is for adding the schema and addingthe core database str to the projeect"""

from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager

from config import DATABASE_PATH


CREATE_ENTRIES_TABLE = """
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    data TEXT NOT NULL,
    file_hash TEXT,
    timestamp INTEGER NOT NULL,
    prev_hash TEXT NOT NULL,
    entry_hash TEXT NOT NULL,
    nonce INTEGER NOT NULL DEFAULT 0,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
"""


def get_db() -> sqlite3.Connection:
    """Open a configured database connection with dictionary-like rows."""
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 10000")
    return connection


def init_db() -> None:
    """Create the schema and database-level append-only protections."""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = get_db()
    try:
        connection.execute("PRAGMA journal_mode = WAL")
        connection.execute(CREATE_ENTRIES_TABLE)
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_entries_entry_hash "
            "ON entries(entry_hash)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_entries_prev_hash "
            "ON entries(prev_hash)"
        )
        connection.commit()
    finally:
        connection.close()


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
