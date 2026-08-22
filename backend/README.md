# HashLog Backend

FastAPI service for an append-only, hash-linked audit trail. The public API
will live under `/api`; interactive documentation will be available at `/docs`.

## Local setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Use `backend/.env.example` as the reference for local configuration. The
database is intentionally local-only and is not committed to Git.
