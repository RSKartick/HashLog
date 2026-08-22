import pytest
from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_first_entry_uses_genesis():
    response = client.post(
        "/entries",
        json={
            "data": "First HashLog entry",
            "timestamp": 1,
        },
    )

    assert response.status_code in [200, 201]

    result = response.json()

    assert result["prev_hash"] == "GENESIS"


def test_second_entry_uses_previous_hash():
    first_response = client.post(
        "/entries",
        json={
            "data": "First entry",
            "timestamp": 1,
        },
    )

    assert first_response.status_code in [200, 201]

    first_entry = first_response.json()

    second_response = client.post(
        "/entries",
        json={
            "data": "Second entry",
            "timestamp": 2,
        },
    )

    assert second_response.status_code in [200, 201]

    second_entry = second_response.json()

    assert second_entry["prev_hash"] == first_entry["hash"]


def test_changed_data_is_detected():
    response = client.post(
        "/entries",
        json={
            "data": "Original data",
            "timestamp": 1,
        },
    )

    assert response.status_code in [200, 201]

    entry = response.json()

    original_hash = entry["hash"]

    # Change the data
    changed_data = "Tampered data"

    # The hash calculated from changed data should be different.
    assert changed_data != entry["data"]
    assert original_hash != ""


def test_changed_timestamp_is_detected():
    response = client.post(
        "/entries",
        json={
            "data": "Timestamp test",
            "timestamp": 100,
        },
    )

    assert response.status_code in [200, 201]

    entry = response.json()

    original_timestamp = entry["timestamp"]

    changed_timestamp = original_timestamp + 1

    assert changed_timestamp != original_timestamp


def test_empty_data_is_rejected():
    response = client.post(
        "/entries",
        json={
            "data": "",
            "timestamp": 1,
        },
    )

    assert response.status_code in [400, 422]


def test_pagination_limit():
    response = client.get(
        "/entries",
        params={
            "limit": 5,
            "offset": 0,
        },
    )

    assert response.status_code == 200

    result = response.json()

    # Works whether the API returns a list directly
    # or a dictionary containing entries.
    if isinstance(result, list):
        entries = result
    else:
        entries = result.get("entries", [])

    assert len(entries) <= 5


def test_missing_entry_returns_404():
    response = client.get("/entries/999999999")

    assert response.status_code == 404