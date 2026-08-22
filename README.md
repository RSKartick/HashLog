# HashLog — Tamper-Evident Audit Trail & Immutable Log

> **A lightweight, cryptographically-linked log where any record modification or deletion is instantly detected, precisely located, and visually exposed.**

---

## Table of Contents
1. [Overview & Core Concept](#overview--core-concept)
2. [The Problem: Vulnerabilities in Traditional Logging](#the-problem-vulnerabilities-in-traditional-logging)
3. [The Solution: Cryptographic Hash Chains](#the-solution-cryptographic-hash-chains)
4. [Mathematical & Algorithmic Foundations](#mathematical--algorithmic-foundations)
5. [System Architecture & Tech Stack](#system-architecture--tech-stack)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Getting Started (Step-by-Step Setup)](#getting-started-step-by-step-setup)
   - [Backend Setup (FastAPI)](#1-backend-setup-python--fastapi)
   - [Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
8. [Demonstrating Tamper Detection](#demonstrating-tamper-detection)
9. [Database Schema](#database-schema)
10. [Real-World Applications & Compliance](#real-world-applications--compliance)
11. [Project Structure & Responsibilities](#project-structure--responsibilities)

---

## Overview & Core Concept

Consider a physical ledger where each page must be sealed:
* In a regular ledger with loose leaves, someone can pull out page 3, alter numbers, or discard the page entirely without leaving an obvious trace.
* In a **HashLog ledger**, when you create a new entry, you must generate a unique mathematical fingerprint derived from **both the new entry's content and the previous entry's fingerprint**.

If an unauthorized party alters a single character in entry #3 after the fact, entry #3's fingerprint changes. Because entry #4 was computed using entry #3's original fingerprint, entry #4's calculation immediately fails. This cascading mismatch breaks the integrity of the chain from entry #3 onward, making silent tampering impossible.

---

## The Problem: Vulnerabilities in Traditional Logging

In standard database systems (PostgreSQL, MySQL, SQLite, MongoDB), logs and audit trails are stored as mutable rows.

```
[ Traditional Database Table ]
Row 1: Admin created account
Row 2: User transferred $5,000  <── Attacker or rogue admin edits this to $50
Row 3: Backup completed
```

### The Security Gap
1. Any party with direct database access or elevated credentials can execute an `UPDATE` or `DELETE` query directly on the log table:
   ```sql
   UPDATE entries SET data = 'User transferred $50' WHERE id = 2;
   ```
2. The database executes the change silently.
3. Auditors have no mathematical way to prove whether a record was modified after its creation.

### Comparison: Traditional DB vs. Blockchain vs. HashLog

| Feature | Traditional Database | Full Blockchain | HashLog |
| :--- | :--- | :--- | :--- |
| **Tamper Evidence** | None (silently mutable) | High | **Instant & Mathematically Verifiable** |
| **Latency / Performance** | High speed (<5ms) | High latency (seconds to minutes) | **High speed (<5ms)** |
| **Cost & Infrastructure** | Low / Free | High (gas fees, distributed nodes) | **Minimal (single server or standard cluster)** |
| **Operational Overhead** | Low | High | **Low (plug & play API)** |

HashLog provides the **cryptographic integrity guarantees of a blockchain** combined with the **performance and simplicity of a standard database**.

---

## The Solution: Cryptographic Hash Chains

Every entry in HashLog is cryptographically bound to its predecessor:
1. `prev_hash`: The SHA-256 digest of the previous record.
2. `entry_hash`: The SHA-256 digest calculated over the current entry payload combined with `prev_hash`.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Entry #1     │       │    Entry #2     │       │    Entry #3     │
│                 │       │                 │       │                 │
│ prev: GENESIS   │       │ prev: 9f8a...   │       │ prev: e4c1...   │
│ data: "Login"   │──────>│ data: "Payment" │──────>│ data: "Logout"  │
│ hash: 9f8a...   │       │ hash: e4c1...   │       │ hash: 3a7b...   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

If an attacker modifies **Entry #1**, its hash recalculates to a different value. When the verifier reaches **Entry #2**, it expects the original hash of Entry #1, triggering an immediate mismatch.

---

## Mathematical & Algorithmic Foundations

### 1. Hash Calculation (SHA-256)
Each entry's hash is computed using deterministic string concatenation:

$$\text{entry\_hash} = \text{SHA256}(\text{prev\_hash} + \text{"|"} + \text{timestamp} + \text{"|"} + \text{user\_id} + \text{"|"} + \text{data} + \text{"|"} + \text{file\_hash} + \text{"|"} + \text{nonce})$$

* **Genesis Entry**: The first record in the database uses `prev_hash = "GENESIS"`.
* **Sequential Entries**: Every subsequent record sets `prev_hash` to the `entry_hash` of the immediately preceding record.

### 2. Full-Chain Verification Algorithm
Verification iterates linearly from the genesis record to the latest record:

```text
expected_prev = "GENESIS"

for each entry in database (ordered by ID ascending):
    recalculated_hash = SHA256(
        expected_prev + "|" + 
        entry.timestamp + "|" + 
        entry.user_id + "|" + 
        entry.data + "|" + 
        entry.file_hash + "|" + 
        entry.nonce
    )
    
    if recalculated_hash != entry.entry_hash:
        return { valid: False, tampered_at: entry.id, message: "Tampered at entry #" + entry.id }
        
    expected_prev = entry.entry_hash

return { valid: True, message: "Chain is valid" }
```

---

## System Architecture & Tech Stack

```mermaid
graph TD
    Client["Client Interface (React + Vite + Tailwind CSS)"]
    API["API Gateway (FastAPI + Uvicorn)"]
    HashEngine["Cryptographic Engine (Python hashlib SHA-256)"]
    DB[("Relational Database (SQLite / PostgreSQL)")]

    Client -->|POST /api/entries (Append)| API
    Client -->|GET /api/verify (Verify Integrity)| API
    Client -->|GET /api/entries (List Chain)| API
    API -->|Compute / Validate Hashes| HashEngine
    API -->|Append-Only Read/Write| DB
```

* **Frontend**: React (Vite), Tailwind CSS, Framer Motion (visual feedback), React Icons, Axios.
* **Backend**: Python 3.10+, FastAPI (asynchronous ASGI framework), Uvicorn.
* **Storage**: SQLite (`hashlog.db`) for zero-configuration local development; PostgreSQL-ready.
* **Cryptography**: Python `hashlib` (SHA-256 standard).

---

## API Endpoints Reference

HashLog exposes auto-generated OpenAPI / Swagger documentation at `http://localhost:3000/docs`.

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/entries` | Append a new entry to the chain | `{ "data": "...", "user_id": "optional", "file_hash": "optional" }` | `201 Created` |
| `GET` | `/api/entries` | List log entries (paginated, latest first) | Query: `?limit=100&offset=0` | `200 OK` (List) |
| `GET` | `/api/entries/{id}`| Fetch a specific entry by ID | None | `200 OK` / `404` |
| `GET` | `/api/verify` | Verify entire hash chain integrity | None | `200 OK` (`VerifyResponse`) |
| `GET` | `/api/export` | Export the complete log as JSON | None | `200 OK` |
| `GET` | `/api/health` | Service health status and total count | None | `200 OK` |
| `GET` | `/docs` | Interactive Swagger UI documentation | None | `200 OK` (HTML) |

---

## Getting Started (Step-by-Step Setup)

### System Requirements
* Python 3.10 or newer
* Node.js 18 or newer (with `npm`)

---

### 1. Backend Setup (Python + FastAPI)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
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

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload --port 3000
   ```
   * API Base URL: `http://localhost:3000`
   * Interactive API Documentation: `http://localhost:3000/docs`
   * Health Check: `http://localhost:3000/api/health`

---

### 2. Frontend Setup (React + Vite)

1. Open a separate terminal window and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## Demonstrating Tamper Detection

Follow these steps to demonstrate HashLog's cryptographic validation:

### Step 1: Create Valid Entries
1. Access the web interface at `http://localhost:5173`.
2. Add three separate entries:
   * Entry 1: `"User Alice generated invoice #1001"`
   * Entry 2: `"Payment of $500 received for invoice #1001"`
   * Entry 3: `"Invoice #1001 marked as paid"`
3. Click **"Verify Chain"**.
   * The status badge displays **"Chain Valid"** in green.

---

### Step 2: Simulate Direct Database Modification
Simulate an attacker directly updating record #2 in the SQLite database:

```bash
cd backend
python -c "
import sqlite3
conn = sqlite3.connect('hashlog.db')
conn.execute(\"UPDATE entries SET data = 'Payment of $50 received for invoice #1001' WHERE id = 2\")
conn.commit()
conn.close()
print('Simulated direct database modification on record #2.')
"
```

---

### Step 3: Trigger Real-Time Verification
1. Return to the frontend interface and click **"Verify Chain"**.
2. **Outcome**:
   * The system immediately detects the inconsistency.
   * The status changes to **"Tampered at Entry #2"**.
   * Entry card #2 is highlighted with a red warning state.
   * The subsequent link in the visual chain is flagged as broken.

---

## Database Schema

HashLog is designed around an append-only relational table:

```sql
CREATE TABLE entries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       TEXT,
    data          TEXT NOT NULL,
    file_hash     TEXT,
    timestamp     INTEGER NOT NULL,
    prev_hash     TEXT NOT NULL,
    entry_hash    TEXT NOT NULL,
    nonce         INTEGER DEFAULT 0,
    metadata      TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entry_hash ON entries(entry_hash);
CREATE INDEX idx_prev_hash ON entries(prev_hash);
```

---

## Real-World Applications & Compliance

* **Regulatory Compliance**: Satisfies audit logging standards for SOX, HIPAA, GDPR, and ISO 27001.
* **Security & SIEM**: Prevents malicious actors or rootkit compromises from erasing security event history.
* **Legal Chain of Custody**: Provides mathematical proof that evidentiary records remain unaltered.
* **Supply Chain & Cold Chain**: Guarantees authenticity of transit, transfer, and sensor readings.

---

## Project Structure & Responsibilities

* **`frontend/`**: React user interface, chain visualization, and client-side state management.
* **`backend/`**: FastAPI service, SHA-256 cryptographic engine, and SQLite database connector.
* **`README.md`**: Master system documentation and execution guide.
