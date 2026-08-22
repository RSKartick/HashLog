"""Tests for the hash-only external-record ledger."""

from __future__ import annotations

import sqlite3

import pytest
from fastapi.testclient import TestClient

from backend import database
from backend.hash_utils import compute_content_hash
from backend.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    test_database = tmp_path / "hashlog-test.db"
    monkeypatch.setattr(database, "DATABASE_PATH", test_database)
    with TestClient(app) as test_client:
        yield test_client


def register(client: TestClient, content: dict) -> dict:
    response = client.post(
        "/api/records/register",
        json={
            "source_system": "test-system",
            "record_type": "audit-event",
            "record_id": "A-1",
            "content": content,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_register_stores_hash_only(client: TestClient):
    result = register(client, {"action": "login", "user": "alice"})

    assert "content" not in result
    assert result["version_number"] == 1
    assert result["previous_version_hash"] is None
    assert result["previous_ledger_hash"] == "GENESIS"
    assert result["content_hash"] == compute_content_hash(
        {"user": "alice", "action": "login"}
    )


def test_canonical_json_ignores_object_key_order(client: TestClient):
    register(client, {"a": 1, "b": 2})
    response = client.post(
        "/api/records/verify",
        json={
            "source_system": "test-system",
            "record_type": "audit-event",
            "record_id": "A-1",
            "content": {"b": 2, "a": 1},
        },
    )
    assert response.status_code == 200
    assert response.json()["valid"] is True


def test_changed_external_content_is_detected(client: TestClient):
    register(client, {"amount": 500, "status": "paid"})
    response = client.post(
        "/api/records/verify",
        json={
            "source_system": "test-system",
            "record_type": "audit-event",
            "record_id": "A-1",
            "content": {"amount": 900, "status": "paid"},
        },
    )
    assert response.status_code == 200
    assert response.json()["valid"] is False


def test_new_version_points_to_previous_version(client: TestClient):
    first = register(client, {"status": "pending"})
    second = register(client, {"status": "approved"})

    assert second["version_number"] == 2
    assert second["previous_version_hash"] == first["entry_hash"]
    history = client.get(
        "/api/records/history",
        params={
            "source_system": "test-system",
            "record_type": "audit-event",
            "record_id": "A-1",
        },
    )
    assert [item["version_number"] for item in history.json()] == [1, 2]


def test_ledger_tampering_is_detected(client: TestClient):
    register(client, {"message": "original"})
    connection = sqlite3.connect(database.DATABASE_PATH)
    connection.execute(
        "UPDATE hash_records SET content_hash = 'tampered' WHERE record_id = 'A-1'"
    )
    connection.commit()
    connection.close()

    response = client.get("/api/ledger/verify")
    assert response.status_code == 200
    assert response.json()["valid"] is False
    assert response.json()["tampered_at"] == 1


def test_tamper_lab_endpoint_corrupts_a_proof_only_when_enabled(client, monkeypatch):
    record = register(client, {"message": "original"})

    monkeypatch.setenv("HASHLOG_ENABLE_TAMPER_TEST", "false")
    disabled = client.post("/api/dev/tamper", json={"record_db_id": record["id"]})
    assert disabled.status_code == 403

    monkeypatch.setenv("HASHLOG_ENABLE_TAMPER_TEST", "true")
    applied = client.post("/api/dev/tamper", json={"record_db_id": record["id"]})
    assert applied.status_code == 200
    assert applied.json()["changed_field"] == "raw_content, content_hash"
    assert applied.json()["trusted_hash"] != applied.json()["actual_hash"]

    audit = client.get("/api/ledger/verify")
    assert audit.json()["valid"] is False
    assert audit.json()["tampered_at"] == record["id"]

    reverted = client.post("/api/dev/tamper/revert", json={"record_db_id": record["id"]})
    assert reverted.status_code == 200
    assert client.get("/api/ledger/verify").json()["valid"] is True


def test_import_hashes_batch_without_returning_content(client: TestClient):
    response = client.post(
        "/api/records/import",
        json={
            "source_system": "server-1",
            "record_type": "access-log",
            "records": [
                {"record_id": "L-1", "content": {"action": "read"}},
                {"record_id": "L-2", "content": {"action": "write"}},
            ],
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["imported_count"] == 2
    assert all("content" not in item for item in body["records"])


def test_signed_certificate_and_external_checkpoint_anchor(client: TestClient):
    register(client, {"message": "certificate"})
    certificate = client.get("/api/audit/certificate")
    assert certificate.status_code == 200
    assert certificate.json()["ledger_valid"] is True
    assert len(certificate.json()["signature"]) == 64

    checkpoint = client.post("/api/checkpoints")
    assert checkpoint.status_code == 201
    anchor = client.get(f"/api/checkpoints/{checkpoint.json()['id']}/anchor")
    assert anchor.status_code == 200
    assert anchor.json()["ledger_hash"] == checkpoint.json()["ledger_hash"]
    assert len(anchor.json()["signature"]) == 64
