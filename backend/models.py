"""Validated request and response schemas for the HashLog API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EntryCreate(BaseModel):
    """Data is formated and proper and no trash data is taken in forit ."""

    model_config = ConfigDict(extra="forbid")

    data: str = Field(..., min_length=1, max_length=10_000)
    user_id: str | None = Field(default=None, max_length=100)
    file_hash: str | None = Field(default=None, max_length=64)
    metadata: dict[str, Any] | None = None

    @field_validator("data")
    @classmethod
    def data_must_not_be_blank(cls, value: str) -> str:
        """Reject whitespace-only messages while preserving user content."""
        if not value.strip():
            raise ValueError("data must contain at least one non-whitespace character")
        return value


class EntryResponse(BaseModel):
    """A stored, hash-linked log entry returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str | None
    data: str
    file_hash: str | None
    timestamp: int
    prev_hash: str
    entry_hash: str
    nonce: int
    metadata: dict[str, Any] | None
    created_at: str | None = None


class VerifyResponse(BaseModel):
    """Result of checking every entry in the chain."""

    valid: bool
    tampered_at: int | None = None
    total_entries: int
    message: str


class HealthResponse(BaseModel):
    """Basic service and database status."""

    status: str
    total_entries: int
