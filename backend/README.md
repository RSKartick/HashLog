# HashLog Backend

FastAPI service for an append-only, cryptographic hash-linked audit trail.

* Main Documentation: [Root README.md](../README.md)
* Interactive Swagger Docs: `http://localhost:3000/docs` (or `http://localhost:8000/docs`)
* API Prefix: `/api`

## Local Setup

### 1. Create and Activate Virtual Environment
* **Linux / macOS:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```
* **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Server
```bash
uvicorn main:app --reload --port 3000
```

Use `backend/.env.example` as reference for local configuration. The SQLite database is created automatically upon startup.

