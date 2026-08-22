"""Canonical hashing helpers for external records and the HashLog ledger."""

from __future__ import annotations

import hashlib
import json
from typing import Any


GENESIS_HASH = "GENESIS"


def canonicalize(value: Any) -> str:
    """Return a deterministic JSON representation of an external record."""
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )


def compute_content_hash(content: Any) -> str:
    """Hash external content without retaining the content in HashLog."""
    return hashlib.sha256(canonicalize(content).encode("utf-8")).hexdigest()


def build_entry_payload(
    *,
    previous_version_hash: str | None,
    previous_ledger_hash: str,
    source_system: str,
    record_type: str,
    record_id: str,
    version_number: int,
    content_hash: str,
    timestamp: int,
) -> str:
    """Build an unambiguous payload for one immutable ledger record."""
    return canonicalize(
        {
            "previous_version_hash": previous_version_hash,
            "previous_ledger_hash": previous_ledger_hash,
            "source_system": source_system,
            "record_type": record_type,
            "record_id": record_id,
            "version_number": version_number,
            "content_hash": content_hash,
            "timestamp": timestamp,
        }
    )


def compute_entry_hash(
    *,
    previous_version_hash: str | None,
    previous_ledger_hash: str,
    source_system: str,
    record_type: str,
    record_id: str,
    version_number: int,
    content_hash: str,
    timestamp: int,
) -> str:
    """Return the SHA-256 hash for one HashLog ledger record."""
    payload = build_entry_payload(
        previous_version_hash=previous_version_hash,
        previous_ledger_hash=previous_ledger_hash,
        source_system=source_system,
        record_type=record_type,
        record_id=record_id,
        version_number=version_number,
        content_hash=content_hash,
        timestamp=timestamp,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
