# HashLog backend

HashLog is a hash-only integrity ledger for records imported from external
systems. The original record content is accepted temporarily in memory so it
can be hashed, but only the hash, source identity, metadata, and immutable
version links are stored in the HashLog database.

## Local setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn main:app --reload --port 8000
```

The interactive API documentation is available at http://localhost:8000/docs.

## Core workflow

1. Register or import an external record with `/api/records/register` or
   `/api/records/import`.
2. HashLog stores the content hash and links the new version to its previous
   version and to the global ledger.
3. Verify current external content later with `/api/records/verify`.
4. Verify the HashLog ledger itself with `/api/ledger/verify`.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/records/register` | Hash one external record |
| POST | `/api/records/import` | Hash a JSON batch without storing content |
| GET | `/api/records` | List stored hash proofs |
| GET | `/api/records/history` | List versions for one source record |
| POST | `/api/records/verify` | Compare current external content with its latest hash |
| GET | `/api/ledger/verify` | Verify global and per-record chains |
| POST | `/api/checkpoints` | Create a ledger-root checkpoint |
| GET | `/api/checkpoints` | List checkpoints |
| GET | `/api/export` | Export hash proofs only |
| GET | `/api/health` | Check service status |

`POST /api/records/register` accepts content such as:

```json
{
  "source_system": "finance-db",
  "record_type": "financial_transaction",
  "record_id": "TX-100",
  "content": {"amount": 500, "status": "paid"},
  "metadata": {"table": "transactions"}
}
```

The response never includes `content`; it includes `content_hash`,
`previous_version_hash`, and `entry_hash` instead.

## Tests

Run from the repository root:

```powershell
pytest -q backend/tests
```

The current tests cover canonical hashing, hash-only storage, imports, version
links, external changes, and ledger tampering.
