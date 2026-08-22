import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    ...(import.meta.env.VITE_API_KEY && { "X-API-Key": import.meta.env.VITE_API_KEY }),
  },
});

// ---------- Records ----------

export async function listRecords({ source_system, record_type, limit = 100, offset = 0 } = {}) {
  const params = { limit, offset };
  if (source_system) params.source_system = source_system;
  if (record_type) params.record_type = record_type;
  const { data } = await api.get("/records", { params });
  return data;
}

export async function registerRecord({ source_system, record_type, record_id, content, metadata }) {
  const { data } = await api.post("/records/register", {
    source_system,
    record_type,
    record_id,
    content,
    metadata,
  });
  return data;
}

export async function importRecords({ source_system, record_type, records }) {
  const { data } = await api.post("/records/import", {
    source_system,
    record_type,
    records,
  });
  return data;
}

export async function recordHistory({ source_system, record_type, record_id }) {
  const { data } = await api.get("/records/history", {
    params: { source_system, record_type, record_id },
  });
  return data;
}

// ---------- Verify ----------

export async function verifyLedger() {
  const { data } = await api.get("/verify");
  return data;
}

export async function verifyRecord({ source_system, record_type, record_id, content }) {
  const { data } = await api.post("/records/verify", {
    source_system,
    record_type,
    record_id,
    content,
  });
  return data;
}

// ---------- Checkpoints ----------

export async function createCheckpoint() {
  const { data } = await api.post("/checkpoints");
  return data;
}

export async function listCheckpoints() {
  const { data } = await api.get("/checkpoints");
  return data;
}

// ---------- Export ----------

export async function exportLedger() {
  const { data } = await api.get("/export");
  return data;
}

// ---------- Health ----------

export async function healthCheck() {
  const { data } = await api.get("/health");
  return data;
}

// ---------- Mock data for offline dev ----------

export function getMockRecords() {
  const now = Date.now();
  return [
    {
      id: 1,
      source_system: "erp",
      record_type: "invoice",
      record_id: "INV-1001",
      version_number: 1,
      content_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      entry_hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      previous_version_hash: null,
      previous_ledger_hash: "GENESIS",
      timestamp: now - 120000,
      metadata: { amount: 500, currency: "USD" },
      created_at: new Date(now - 120000).toISOString(),
    },
    {
      id: 2,
      source_system: "erp",
      record_type: "invoice",
      record_id: "INV-1001",
      version_number: 2,
      content_hash: "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
      entry_hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
      previous_version_hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      previous_ledger_hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      timestamp: now - 60000,
      metadata: { amount: 500, currency: "USD", status: "paid" },
      created_at: new Date(now - 60000).toISOString(),
    },
    {
      id: 3,
      source_system: "hr",
      record_type: "contract",
      record_id: "CTR-042",
      version_number: 1,
      content_hash: "d4735e3a265e16bee03f3ea1adf0c7e2b68f2b4c8e4f7d8f7c9b0a1e2d3c4b5",
      entry_hash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      previous_version_hash: null,
      previous_ledger_hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
      timestamp: now,
      metadata: { employee: "alice", department: "engineering" },
      created_at: new Date(now).toISOString(),
    },
  ];
}

export function getMockVerification() {
  return { valid: true, total_records: 3, message: "Ledger is valid" };
}

export function getMockHealth() {
  return { status: "ok", total_hash_records: 3 };
}

export function getMockCheckpoints() {
  return [
    { id: 1, last_record_id: 3, ledger_hash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4", created_at: new Date().toISOString() },
  ];
}
