from backend.hash_utils import compute_entry_hash


def test_hash_is_deterministic():
    first_hash = compute_entry_hash(
        prev_hash="GENESIS",
        timestamp=1,
        user_id=None,
        data="hello",
        file_hash=None,
        nonce=0,
    )

    second_hash = compute_entry_hash(
        prev_hash="GENESIS",
        timestamp=1,
        user_id=None,
        data="hello",
        file_hash=None,
        nonce=0,
    )

    assert first_hash == second_hash
# They can also test that changing the data changes the hash:
def test_changed_data_changes_hash():
    original = compute_entry_hash(
        prev_hash="GENESIS",
        timestamp=1,
        user_id=None,
        data="hello",
        file_hash=None,
        nonce=0,
    )

    changed = compute_entry_hash(
        prev_hash="GENESIS",
        timestamp=1,
        user_id=None,
        data="hacked",
        file_hash=None,
        nonce=0,
    )

    assert original != changed