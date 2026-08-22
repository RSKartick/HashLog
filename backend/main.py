"""FastAPI application for the HashLog tamper-evident log."""

from __future__ import annotations

import json
import sqlite3
import time
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

try:  # Supports both `uvicorn main:app` from backend/ and package imports.
    from .config import cors_origins
    from .database import db_session, init_db
    from .hash_utils import GENESIS_HASH, compute_entry_hash
    from .models import EntryCreate, EntryResponse, HealthResponse, VerifyResponse
except ImportError:  # pragma: no cover - exercised by the local uvicorn command.
    from config import cors_origins
    from database import db_session, init_db
    from hash_utils import GENESIS_HASH, compute_entry_hash
    from models import EntryCreate, EntryResponse, HealthResponse, VerifyResponse


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize the local schema before the server accepts requests."""
    init_db()
    yield


app = FastAPI(
    title="HashLog API",
    description="Tamper-evident, cryptographically linked audit trail.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _parse_metadata(value: str | None) -> dict[str, Any] | None:
    """Decode the JSON metadata stored in SQLite."""
    if value is None:
        return None
    try:
        parsed = json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return None
    return parsed if isinstance(parsed, dict) else None


def _entry_from_row(row: sqlite3.Row) -> EntryResponse:
    """Convert a SQLite row to the public response schema."""
    entry = dict(row)
    entry["metadata"] = _parse_metadata(entry.get("metadata"))
    return EntryResponse(**entry)


def _last_entry_hash(connection: sqlite3.Connection) -> str:
    row = connection.execute(
        "SELECT entry_hash FROM entries ORDER BY id DESC LIMIT 1"
    ).fetchone()
    return row["entry_hash"] if row else GENESIS_HASH


@app.post("/api/entries", response_model=EntryResponse, status_code=201)
def create_entry(entry: EntryCreate) -> EntryResponse:
    """Append one entry to the end of the hash chain."""
    try:
        with db_session() as connection:
            # Serialize writers so two simultaneous requests cannot share a
            # previous hash and fork the chain.
            connection.execute("BEGIN IMMEDIATE")
            prev_hash = _last_entry_hash(connection)
            timestamp = time.time_ns() // 1_000_000
            nonce = 0
            entry_hash = compute_entry_hash(
                prev_hash=prev_hash,
                timestamp=timestamp,
                user_id=entry.user_id,
                data=entry.data,
                file_hash=entry.file_hash,
                nonce=nonce,
            )
            metadata_json = (
                json.dumps(entry.metadata, ensure_ascii=False, separators=(",", ":"))
                if entry.metadata is not None
                else None
            )
            cursor = connection.execute(
                """
                INSERT INTO entries
                    (user_id, data, file_hash, timestamp, prev_hash,
                     entry_hash, nonce, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry.user_id,
                    entry.data,
                    entry.file_hash,
                    timestamp,
                    prev_hash,
                    entry_hash,
                    nonce,
                    metadata_json,
                ),
            )
            row = connection.execute(
                "SELECT * FROM entries WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
            assert row is not None
            return _entry_from_row(row)
    except sqlite3.Error as exc:
        raise HTTPException(status_code=500, detail="Could not save entry") from exc


@app.get("/api/entries", response_model=list[EntryResponse])
def list_entries(
    limit: Annotated[int, Query(ge=1, le=1_000)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[EntryResponse]:
    """Return entries newest first, with bounded pagination."""
    with db_session() as connection:
        rows = connection.execute(
            "SELECT * FROM entries ORDER BY id DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
    return [_entry_from_row(row) for row in rows]


@app.get("/api/entries/{entry_id}", response_model=EntryResponse)
def get_entry(entry_id: int) -> EntryResponse:
    """Return one entry by its database ID."""
    with db_session() as connection:
        row = connection.execute(
            "SELECT * FROM entries WHERE id = ?", (entry_id,)
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _entry_from_row(row)


@app.get("/api/verify", response_model=VerifyResponse)
def verify_chain() -> VerifyResponse:
    """Recompute the complete chain and report its first invalid entry."""
    with db_session() as connection:
        rows = connection.execute("SELECT * FROM entries ORDER BY id ASC").fetchall()

    expected_previous = GENESIS_HASH
    for row in rows:
        entry = dict(row)
        entry_id = entry["id"]
        if entry["prev_hash"] != expected_previous:
            return VerifyResponse(
                valid=False,
                tampered_at=entry_id,
                total_entries=len(rows),
                message=f"Tampering detected at entry #{entry_id}",
            )
        computed = compute_entry_hash(
            prev_hash=expected_previous,
            timestamp=entry["timestamp"],
            user_id=entry["user_id"],
            data=entry["data"],
            file_hash=entry["file_hash"],
            nonce=entry["nonce"],
        )
        if computed != entry["entry_hash"]:
            return VerifyResponse(
                valid=False,
                tampered_at=entry_id,
                total_entries=len(rows),
                message=f"Tampering detected at entry #{entry_id}",
            )
        expected_previous = entry["entry_hash"]

    return VerifyResponse(
        valid=True,
        total_entries=len(rows),
        message="Chain is valid",
    )


@app.get("/api/export", response_model=list[EntryResponse])
def export_log() -> list[EntryResponse]:
    """Return the complete chain in chronological order."""
    with db_session() as connection:
        rows = connection.execute("SELECT * FROM entries ORDER BY id ASC").fetchall()
    return [_entry_from_row(row) for row in rows]


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Return service status and the number of stored entries."""
    with db_session() as connection:
        count = connection.execute("SELECT COUNT(*) AS count FROM entries").fetchone()[
            "count"
        ]
    return HealthResponse(status="ok", total_entries=count)


@app.get("/")
def root() -> dict[str, str]:
    """Basic landing response for humans and deployment health probes."""
    return {"message": "HashLog API", "docs": "/docs"}
