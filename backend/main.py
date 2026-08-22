"""FastAPI application for the HashLog external integrity ledger."""

#to run the app

#pip install -r requirements-dev.txt

#cd backend
#uvicorn main:app --reload --port 8000


from __future__ import annotations

import json
import hashlib
import hmac
import secrets
import sqlite3
import time
from contextlib import asynccontextmanager
from typing import Annotated, Any
from urllib.parse import urlencode
from urllib.request import Request as UrlRequest, urlopen

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

try:
    from .config import api_key, cors_origins, rate_limit_per_minute, signing_secret, tamper_test_enabled, turnstile_secret_key
    from .database import db_session, init_db
    from .hash_utils import GENESIS_HASH, compute_content_hash, compute_entry_hash
    from .models import (
        CheckpointResponse,
        CheckpointVerifyResponse,
        HashRecordResponse,
        HealthResponse,
        ImportRequest,
        ImportResponse,
        LedgerVerifyResponse,
        RecordRegister,
        RecordVerifyRequest,
        RecordVerifyResponse,
        TamperTestRequest,
        TamperTestResponse,
        AuditCertificateResponse,
        CheckpointAnchorResponse,
        CaptchaVerifyRequest,
        CaptchaVerifyResponse,
    )
except ImportError:  # pragma: no cover - supports `uvicorn main:app` in backend/.
    from config import api_key, cors_origins, rate_limit_per_minute, signing_secret, tamper_test_enabled, turnstile_secret_key
    from database import db_session, init_db
    from hash_utils import GENESIS_HASH, compute_content_hash, compute_entry_hash
    from models import (
        CheckpointResponse,
        CheckpointVerifyResponse,
        HashRecordResponse,
        HealthResponse,
        ImportRequest,
        ImportResponse,
        LedgerVerifyResponse,
        RecordRegister,
        RecordVerifyRequest,
        RecordVerifyResponse,
        TamperTestRequest,
        TamperTestResponse,
        AuditCertificateResponse,
        CheckpointAnchorResponse,
        CaptchaVerifyRequest,
        CaptchaVerifyResponse,
    )


_rate_limit_hits: dict[str, list[float]] = {}
_tamper_backups: dict[int, tuple[str, str]] = {}


def require_api_key(
    request: Request,
    x_api_key: str | None = Header(default=None),
) -> None:
    """Require X-API-Key only when HASHLOG_API_KEY is configured."""
    expected = api_key()
    if expected is not None and not secrets.compare_digest(x_api_key or "", expected):
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    client = request.client.host if request.client else "unknown"
    now = time.monotonic()
    recent = [stamp for stamp in _rate_limit_hits.get(client, []) if now - stamp < 60]
    if len(recent) >= rate_limit_per_minute():
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    recent.append(now)
    _rate_limit_hits[client] = recent


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize the schema before accepting requests."""
    init_db()
    yield


app = FastAPI(
    title="HashLog API",
    description=(
        "Hash-only, append-only integrity ledger for records imported from "
        "external systems."
    ),
    version="2.0.0",
    lifespan=lifespan,
    dependencies=[Depends(require_api_key)],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _metadata_json(metadata: dict[str, Any] | None) -> str | None:
    if metadata is None:
        return None
    return json.dumps(metadata, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _parse_metadata(value: str | None) -> dict[str, Any] | None:
    if value is None:
        return None
    try:
        parsed = json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return None
    return parsed if isinstance(parsed, dict) else None


def _sign_payload(payload: dict[str, Any]) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hmac.new(signing_secret().encode("utf-8"), canonical.encode("utf-8"), hashlib.sha256).hexdigest()


def _response_from_row(row: sqlite3.Row) -> HashRecordResponse:
    item = dict(row)
    item["metadata"] = _parse_metadata(item.get("metadata"))
    return HashRecordResponse(**item)


def _identity_where(source_system: str, record_type: str, record_id: str) -> tuple[str, tuple[str, str, str]]:
    return (
        "source_system = ? AND record_type = ? AND record_id = ?",
        (source_system, record_type, record_id),
    )


def _latest_for_identity(
    connection: sqlite3.Connection,
    source_system: str,
    record_type: str,
    record_id: str,
) -> sqlite3.Row | None:
    where, values = _identity_where(source_system, record_type, record_id)
    return connection.execute(
        f"SELECT * FROM hash_records WHERE {where} ORDER BY version_number DESC LIMIT 1",
        values,
    ).fetchone()


def _last_ledger_hash(connection: sqlite3.Connection) -> str:
    row = connection.execute(
        "SELECT entry_hash FROM hash_records ORDER BY id DESC LIMIT 1"
    ).fetchone()
    return row["entry_hash"] if row else GENESIS_HASH


def _append_hash_record(
    connection: sqlite3.Connection,
    *,
    source_system: str,
    record_type: str,
    record_id: str,
    content: Any,
    metadata: dict[str, Any] | None,
) -> HashRecordResponse:
    """Hash content in memory and append only its proof to SQLite."""
    latest = _latest_for_identity(connection, source_system, record_type, record_id)
    version_number = (latest["version_number"] + 1) if latest else 1
    previous_version_hash = latest["entry_hash"] if latest else None
    previous_ledger_hash = _last_ledger_hash(connection)
    timestamp = time.time_ns() // 1_000_000
    content_hash = compute_content_hash(content)
    entry_hash = compute_entry_hash(
        previous_version_hash=previous_version_hash,
        previous_ledger_hash=previous_ledger_hash,
        source_system=source_system,
        record_type=record_type,
        record_id=record_id,
        version_number=version_number,
        content_hash=content_hash,
        timestamp=timestamp,
    )
    cursor = connection.execute(
        """
        INSERT INTO hash_records
            (source_system, record_type, record_id, version_number,
             content_hash, entry_hash, previous_version_hash, previous_ledger_hash,
             timestamp, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            source_system,
            record_type,
            record_id,
            version_number,
            content_hash,
            entry_hash,
            previous_version_hash,
            previous_ledger_hash,
            timestamp,
            _metadata_json(metadata),
        ),
    )
    row = connection.execute(
        "SELECT * FROM hash_records WHERE id = ?", (cursor.lastrowid,)
    ).fetchone()
    if row is None:
        raise RuntimeError("Hash record was not created")
    item = dict(row)
    item["metadata"] = metadata
    return HashRecordResponse(**item)


# SQLite stores the ledger hash as a generated application value. This helper
# keeps the value in the response while the schema stores it as content_hash
# plus the links; the actual entry hash is reconstructed during verification.
def _entry_hash_for_row(row: sqlite3.Row) -> str:
    return compute_entry_hash(
        previous_version_hash=row["previous_version_hash"],
        previous_ledger_hash=row["previous_ledger_hash"],
        source_system=row["source_system"],
        record_type=row["record_type"],
        record_id=row["record_id"],
        version_number=row["version_number"],
        content_hash=row["content_hash"],
        timestamp=row["timestamp"],
    )


def _response_with_entry_hash(row: sqlite3.Row) -> HashRecordResponse:
    item = dict(row)
    item["entry_hash"] = _entry_hash_for_row(row)
    item["metadata"] = _parse_metadata(item.get("metadata"))
    return HashRecordResponse(**item)


@app.post("/api/records/register", response_model=HashRecordResponse, status_code=201)
def register_record(request: RecordRegister) -> HashRecordResponse:
    """Hash one external record and store only its integrity proof."""
    try:
        with db_session() as connection:
            connection.execute("BEGIN IMMEDIATE")
            result = _append_hash_record(
                connection,
                source_system=request.source_system,
                record_type=request.record_type,
                record_id=request.record_id,
                content=request.content,
                metadata=request.metadata,
            )
            return result
    except sqlite3.Error as exc:
        raise HTTPException(status_code=500, detail="Could not register record") from exc


@app.post("/api/records/import", response_model=ImportResponse, status_code=201)
def import_records(request: ImportRequest) -> ImportResponse:
    """Hash a JSON batch in memory and persist only its hash proofs."""
    try:
        with db_session() as connection:
            connection.execute("BEGIN IMMEDIATE")
            results = [
                _append_hash_record(
                    connection,
                    source_system=request.source_system,
                    record_type=request.record_type,
                    record_id=record.record_id,
                    content=record.content,
                    metadata=record.metadata,
                )
                for record in request.records
            ]
            return ImportResponse(
                source_system=request.source_system,
                record_type=request.record_type,
                imported_count=len(results),
                records=results,
            )
    except sqlite3.Error as exc:
        raise HTTPException(status_code=500, detail="Could not import records") from exc


@app.get("/api/records", response_model=list[HashRecordResponse])
def list_records(
    source_system: str | None = None,
    record_type: str | None = None,
    limit: Annotated[int, Query(ge=1, le=1_000)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[HashRecordResponse]:
    """List hash proofs without returning external record contents."""
    clauses: list[str] = []
    values: list[Any] = []
    if source_system:
        clauses.append("source_system = ?")
        values.append(source_system)
    if record_type:
        clauses.append("record_type = ?")
        values.append(record_type)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    with db_session() as connection:
        rows = connection.execute(
            f"SELECT * FROM hash_records {where} ORDER BY id DESC LIMIT ? OFFSET ?",
            (*values, limit, offset),
        ).fetchall()
    return [_response_with_entry_hash(row) for row in rows]


@app.get("/api/records/history", response_model=list[HashRecordResponse])
def record_history(
    source_system: str,
    record_type: str,
    record_id: str,
) -> list[HashRecordResponse]:
    """Return every immutable hash version for one external record."""
    where, values = _identity_where(source_system, record_type, record_id)
    with db_session() as connection:
        rows = connection.execute(
            f"SELECT * FROM hash_records WHERE {where} ORDER BY version_number ASC",
            values,
        ).fetchall()
    return [_response_with_entry_hash(row) for row in rows]


@app.post("/api/records/verify", response_model=RecordVerifyResponse)
def verify_external_record(request: RecordVerifyRequest) -> RecordVerifyResponse:
    """Compare current external content with the latest registered hash."""
    with db_session() as connection:
        latest = _latest_for_identity(
            connection, request.source_system, request.record_type, request.record_id
        )
    if latest is None:
        raise HTTPException(status_code=404, detail="No trusted hash for this record")
    actual_hash = compute_content_hash(request.content)
    valid = actual_hash == latest["content_hash"]
    return RecordVerifyResponse(
        valid=valid,
        source_system=request.source_system,
        record_type=request.record_type,
        record_id=request.record_id,
        latest_version=latest["version_number"],
        expected_hash=latest["content_hash"],
        actual_hash=actual_hash,
        message=(
            "External record matches the latest registered version"
            if valid
            else "External record has changed since the latest registered version"
        ),
    )


def _verify_ledger_rows(rows: list[sqlite3.Row]) -> LedgerVerifyResponse:
    expected_ledger = GENESIS_HASH
    latest_by_identity: dict[tuple[str, str, str], sqlite3.Row] = {}
    for row in rows:
        identity = (row["source_system"], row["record_type"], row["record_id"])
        previous_for_record = latest_by_identity.get(identity)
        expected_version = (previous_for_record["version_number"] + 1) if previous_for_record else 1
        if (
            row["previous_ledger_hash"] != expected_ledger
            or row["version_number"] != expected_version
            or row["previous_version_hash"]
            != (previous_for_record["entry_hash"] if previous_for_record else None)
        ):
            return LedgerVerifyResponse(
                valid=False,
                tampered_at=row["id"],
                total_records=len(rows),
                message=f"Ledger tampering detected at record #{row['id']}",
            )
        computed = _entry_hash_for_row(row)
        if row["entry_hash"] != computed:
            return LedgerVerifyResponse(
                valid=False,
                tampered_at=row["id"],
                total_records=len(rows),
                message=f"Ledger tampering detected at record #{row['id']}",
            )
        expected_ledger = computed
        row_dict = dict(row)
        row_dict["entry_hash"] = computed
        # Keep the fields needed for the next version without mutating SQLite.
        latest_by_identity[identity] = _RowProxy(row_dict)  # type: ignore[assignment]
    return LedgerVerifyResponse(valid=True, total_records=len(rows), message="Ledger is valid")


class _RowProxy(dict):
    """Minimal row-like object used by ledger verification state."""

    def __getitem__(self, key: str) -> Any:
        return super().__getitem__(key)


@app.get("/api/ledger/verify", response_model=LedgerVerifyResponse)
@app.get("/api/verify", response_model=LedgerVerifyResponse, include_in_schema=False)
def verify_ledger() -> LedgerVerifyResponse:
    """Verify the global ledger and every per-record version chain."""
    with db_session() as connection:
        rows = connection.execute("SELECT * FROM hash_records ORDER BY id ASC").fetchall()
    return _verify_ledger_rows(rows)


@app.post("/api/dev/tamper", response_model=TamperTestResponse)
def simulate_tamper(request: TamperTestRequest) -> TamperTestResponse:
    """Intentionally corrupt one stored hash for a local demonstration."""
    if not tamper_test_enabled():
        raise HTTPException(
            status_code=403,
            detail="Tamper simulation is disabled. Set HASHLOG_ENABLE_TAMPER_TEST=true for local testing.",
        )

    with db_session() as connection:
        row = connection.execute(
            "SELECT id FROM hash_records WHERE id = ?", (request.record_db_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Hash record not found")
        original = connection.execute(
            "SELECT content_hash, entry_hash FROM hash_records WHERE id = ?",
            (request.record_db_id,),
        ).fetchone()
        if request.record_db_id not in _tamper_backups:
            _tamper_backups[request.record_db_id] = (
                original["content_hash"],
                original["entry_hash"],
            )
        connection.execute(
            "UPDATE hash_records SET content_hash = ? WHERE id = ?",
            ("0" * 64, request.record_db_id),
        )
        connection.commit()

    return TamperTestResponse(
        record_db_id=request.record_db_id,
        changed_field="content_hash",
        message="Test tamper applied. Run the full ledger audit to detect it.",
    )


@app.post("/api/dev/tamper/revert", response_model=TamperTestResponse)
def revert_tamper(request: TamperTestRequest) -> TamperTestResponse:
    """Restore a proof changed by the current Tamper Lab session."""
    if not tamper_test_enabled():
        raise HTTPException(status_code=403, detail="Tamper simulation is disabled")
    backup = _tamper_backups.get(request.record_db_id)
    if backup is None:
        raise HTTPException(status_code=404, detail="No temporary tamper backup exists for this proof")
    with db_session() as connection:
        row = connection.execute(
            "SELECT id FROM hash_records WHERE id = ?", (request.record_db_id,)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Hash record not found")
        connection.execute(
            "UPDATE hash_records SET content_hash = ?, entry_hash = ? WHERE id = ?",
            (backup[0], backup[1], request.record_db_id),
        )
        connection.commit()
    _tamper_backups.pop(request.record_db_id, None)
    return TamperTestResponse(
        record_db_id=request.record_db_id,
        changed_field="content_hash, entry_hash",
        message="Original proof restored. Run the full ledger audit to confirm.",
    )


@app.post("/api/checkpoints", response_model=CheckpointResponse, status_code=201)
def create_checkpoint() -> CheckpointResponse:
    """Create a ledger-root checkpoint for later independent anchoring."""
    with db_session() as connection:
        latest = connection.execute(
            "SELECT * FROM hash_records ORDER BY id DESC LIMIT 1"
        ).fetchone()
        if latest is None:
            raise HTTPException(status_code=400, detail="Cannot checkpoint an empty ledger")
        cursor = connection.execute(
            "INSERT INTO checkpoints (last_record_id, ledger_hash) VALUES (?, ?)",
            (latest["id"], _entry_hash_for_row(latest)),
        )
        row = connection.execute(
            "SELECT * FROM checkpoints WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return CheckpointResponse(**dict(row))


@app.get("/api/checkpoints", response_model=list[CheckpointResponse])
def list_checkpoints() -> list[CheckpointResponse]:
    with db_session() as connection:
        rows = connection.execute("SELECT * FROM checkpoints ORDER BY id DESC").fetchall()
    return [CheckpointResponse(**dict(row)) for row in rows]


@app.get(
    "/api/checkpoints/{checkpoint_id}/verify",
    response_model=CheckpointVerifyResponse,
)
def verify_checkpoint(checkpoint_id: int) -> CheckpointVerifyResponse:
    """Verify all ledger records covered by one checkpoint."""
    with db_session() as connection:
        checkpoint = connection.execute(
            "SELECT * FROM checkpoints WHERE id = ?", (checkpoint_id,)
        ).fetchone()
        if checkpoint is None:
            raise HTTPException(status_code=404, detail="Checkpoint not found")
        rows = connection.execute(
            "SELECT * FROM hash_records WHERE id <= ? ORDER BY id ASC",
            (checkpoint["last_record_id"],),
        ).fetchall()
    ledger_result = _verify_ledger_rows(rows)
    actual_hash = rows[-1]["entry_hash"] if rows else None
    valid = ledger_result.valid and actual_hash == checkpoint["ledger_hash"]
    return CheckpointVerifyResponse(
        valid=valid,
        checkpoint_id=checkpoint_id,
        last_record_id=checkpoint["last_record_id"],
        expected_ledger_hash=checkpoint["ledger_hash"],
        actual_ledger_hash=actual_hash,
        message=(
            "Checkpoint matches the ledger"
            if valid
            else "Ledger no longer matches this checkpoint"
        ),
    )


@app.get("/api/export", response_model=list[HashRecordResponse])
def export_ledger() -> list[HashRecordResponse]:
    """Export hash proofs only, in chronological order."""
    with db_session() as connection:
        rows = connection.execute("SELECT * FROM hash_records ORDER BY id ASC").fetchall()
    return [_response_with_entry_hash(row) for row in rows]


@app.get("/api/audit/certificate", response_model=AuditCertificateResponse)
def audit_certificate() -> AuditCertificateResponse:
    """Create a signed, hash-only audit certificate for external evidence."""
    with db_session() as connection:
        rows = connection.execute("SELECT * FROM hash_records ORDER BY id ASC").fetchall()
        checkpoints = connection.execute("SELECT id FROM checkpoints ORDER BY id ASC").fetchall()
    result = _verify_ledger_rows(rows)
    payload = {
        "certificate_type": "HASHLOG_AUDIT_CERTIFICATE_V1",
        "issued_at": int(time.time()),
        "ledger_valid": result.valid,
        "total_records": result.total_records,
        "tampered_at": result.tampered_at,
        "ledger_root": rows[-1]["entry_hash"] if rows else GENESIS_HASH,
    }
    return AuditCertificateResponse(**payload, signature=_sign_payload(payload))


@app.get("/api/checkpoints/{checkpoint_id}/anchor", response_model=CheckpointAnchorResponse)
def download_checkpoint_anchor(checkpoint_id: int) -> CheckpointAnchorResponse:
    """Return a signed checkpoint for storage in an independent system."""
    with db_session() as connection:
        checkpoint = connection.execute(
            "SELECT * FROM checkpoints WHERE id = ?", (checkpoint_id,)
        ).fetchone()
    if checkpoint is None:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    payload = {
        "anchor_type": "HASHLOG_CHECKPOINT_ANCHOR_V1",
        "checkpoint_id": checkpoint["id"],
        "last_record_id": checkpoint["last_record_id"],
        "ledger_hash": checkpoint["ledger_hash"],
        "created_at": checkpoint["created_at"],
        "anchored_at": int(time.time()),
    }
    return CheckpointAnchorResponse(**payload, signature=_sign_payload(payload))


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    with db_session() as connection:
        total = connection.execute("SELECT COUNT(*) AS count FROM hash_records").fetchone()[
            "count"
        ]
    return HealthResponse(status="ok", total_hash_records=total)


@app.post("/api/captcha/verify", response_model=CaptchaVerifyResponse)
def verify_captcha(request: CaptchaVerifyRequest) -> CaptchaVerifyResponse:
    """Validate a Turnstile token server-side before first app access."""
    secret = turnstile_secret_key()
    if secret is None:
        # Local development can run without a provider configuration.
        return CaptchaVerifyResponse(success=True, message="CAPTCHA is not configured in this environment")
    body = urlencode({"secret": secret, "response": request.token}).encode("utf-8")
    try:
        http_request = UrlRequest(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urlopen(http_request, timeout=8) as response:
            result = json.loads(response.read().decode("utf-8"))
    except Exception as exc:  # network/provider failures should not expose internals
        raise HTTPException(status_code=502, detail="CAPTCHA verification service unavailable") from exc
    if not result.get("success"):
        return CaptchaVerifyResponse(success=False, message="CAPTCHA verification failed")
    return CaptchaVerifyResponse(success=True, message="CAPTCHA verified")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "HashLog API", "docs": "/docs"}
