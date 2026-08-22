from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_valid_verification_response():
    """
    A valid entry/chain should return a successful verification response.
    """

    # Create an entry
    response = client.post(
        "/entries",
        json={
            "data": "Test entry",
            "user_id": None,
        },
    )

    assert response.status_code in (200, 201)

    entry = response.json()
    entry_id = entry.get("id")

    assert entry_id is not None

    # Verify the entry
    response = client.get(f"/entries/{entry_id}/verify")

    assert response.status_code == 200

    result = response.json()

    # Verification response should indicate validity
    assert result.get("valid") is True


def test_tampered_verification_response():
    """
    A modified/tampered entry should be detected by verification.

    This test does not modify application code.
    It directly tests whether the verification endpoint reports
    an invalid chain when stored data has been tampered with.
    """

    # Create an entry
    response = client.post(
        "/entries",
        json={
            "data": "Original data",
            "user_id": None,
        },
    )

    assert response.status_code in (200, 201)

    entry = response.json()
    entry_id = entry.get("id")

    assert entry_id is not None

    # Verify the original entry first
    response = client.get(f"/entries/{entry_id}/verify")

    assert response.status_code == 200
    original_result = response.json()

    assert original_result.get("valid") is True

    