"""Cryptographic hash loging."""

from __future__ import annotations

import hashlib


GENESIS_HASH = "GENESIS"


def build_hash_payload(
    *,
    prev_hash: str,
    timestamp: int,
    user_id: str | None,
    data: str,
    file_hash: str | None,
    nonce: int,
) -> str:
    """Build the string that gets hashed
    """
    return "|".join(
        (
            prev_hash,
            str(timestamp),
            user_id or "anonymous",
            data,
            file_hash or "",
            str(nonce),
        )
    )


def compute_entry_hash(#this is the thing that creats the hash 
    *,
    prev_hash: str,
    timestamp: int,
    user_id: str | None,
    data: str,
    file_hash: str | None,
    nonce: int,
) -> str:
    """Return the lowercase SHA-256 hex digest for one log  entry"""
    payload = build_hash_payload(
        prev_hash=prev_hash,
        timestamp=timestamp,
        user_id=user_id,
        data=data,
        file_hash=file_hash,
        nonce=nonce,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
