# HashLog backend

HashLog is an append-only integrity ledger with raw version snapshots and
cryptographic proofs for records imported from external
systems. External content is accepted temporarily to calculate a hash; only
the hash, source identity, metadata, and immutable version links are stored.

## Local setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn main:app --reload --port 8000
```

Open http://localhost:8000/docs for Swagger UI. Set `HASHLOG_API_KEY` for a
deployed environment; clients then send the same value in `X-API-Key`.

## API

```text
POST /api/records/register              Hash one external record
POST /api/records/import                Hash a JSON batch
GET  /api/records                       List hash proofs
GET  /api/records/history               List versions for one record
POST /api/records/verify                Verify current external content
GET  /api/ledger/verify                 Verify global and version chains
POST /api/checkpoints                   Create a ledger checkpoint
GET  /api/checkpoints                   List checkpoints
GET  /api/checkpoints/{id}/verify       Verify a checkpoint
GET  /api/checkpoints/{id}/anchor       Download a signed external anchor
GET  /api/audit/certificate             Download a signed audit certificate
GET  /api/export                        Export hashes only
GET  /api/health                        Check service status
```

The response from registration never includes the original content. It
contains `content_hash`, `previous_version_hash`, and `entry_hash` instead.

## Tests

Run from the repository root:

```powershell
pytest -q backend/tests
```
