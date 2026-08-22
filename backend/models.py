"""Validated request and response schemas for the hash-only API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RecordRegister(BaseModel):
    """External record content is accepted transiently and never persisted."""

    model_config = ConfigDict(extra="forbid")

    source_system: str = Field(..., min_length=1, max_length=200)
    record_type: str = Field(..., min_length=1, max_length=100)
    record_id: str = Field(..., min_length=1, max_length=255)
    content: Any
    metadata: dict[str, Any] | None = None

    @field_validator("source_system", "record_type", "record_id")
    @classmethod
    def identifiers_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("identifier must contain a non-whitespace character")
        return value


class ImportedRecord(BaseModel):
    """One item in a multi-record import batch."""

    model_config = ConfigDict(extra="forbid")

    record_id: str = Field(..., min_length=1, max_length=255)
    content: Any
    metadata: dict[str, Any] | None = None


class ImportRequest(BaseModel):
    """Batch of external records whose contents are hashed in memory."""

    model_config = ConfigDict(extra="forbid")

    source_system: str = Field(..., min_length=1, max_length=200)
    record_type: str = Field(..., min_length=1, max_length=100)
    records: list[ImportedRecord] = Field(..., min_length=1, max_length=1_000)


class HashRecordResponse(BaseModel):
    """Hash-only record stored in the HashLog database."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    source_system: str
    record_type: str
    record_id: str
    version_number: int
    content_hash: str
    previous_version_hash: str | None
    previous_ledger_hash: str
    entry_hash: str
    timestamp: int
    metadata: dict[str, Any] | None
    created_at: str | None = None


class ImportResponse(BaseModel):
    """Result of importing one batch."""

    source_system: str
    record_type: str
    imported_count: int
    records: list[HashRecordResponse]


class RecordVerifyRequest(BaseModel):
    """Current external content supplied for on-demand verification."""

    model_config = ConfigDict(extra="forbid")

    source_system: str = Field(..., min_length=1, max_length=200)
    record_type: str = Field(..., min_length=1, max_length=100)
    record_id: str = Field(..., min_length=1, max_length=255)
    content: Any


class RecordVerifyResponse(BaseModel):
    """Comparison between current external content and its trusted hash."""

    valid: bool
    source_system: str
    record_type: str
    record_id: str
    latest_version: int | None
    expected_hash: str | None
    actual_hash: str
    message: str


class LedgerVerifyResponse(BaseModel):
    """Result of verifying the global and per-record hash chains."""

    valid: bool
    tampered_at: int | None = None
    total_records: int
    message: str


class CheckpointResponse(BaseModel):
    """A point-in-time ledger root suitable for independent anchoring."""

    id: int
    last_record_id: int
    ledger_hash: str
    created_at: str | None = None


class CheckpointVerifyResponse(BaseModel):
    """Whether a stored checkpoint still matches the ledger at its boundary."""

    valid: bool
    checkpoint_id: int
    last_record_id: int
    expected_ledger_hash: str
    actual_ledger_hash: str | None
    message: str


class HealthResponse(BaseModel):
    """Basic service and ledger status."""

    status: str
    total_hash_records: int
