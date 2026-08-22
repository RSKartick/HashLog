import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    ...(import.meta.env.VITE_API_KEY && { "X-API-Key": import.meta.env.VITE_API_KEY }),
  },
});

// Helper for client-side SHA-256 preview
export async function sha256(input) {
  const str = typeof input === "object" ? JSON.stringify(input) : String(input ?? "");
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Compute an entry hash following HashLog's exact formula
export async function computeClientEntryHash({
  previous_version_hash,
  previous_ledger_hash,
  source_system,
  record_type,
  record_id,
  version_number,
  content_hash,
  timestamp,
}) {
  const payload = [
    previous_version_hash || "NONE",
    previous_ledger_hash || "GENESIS",
    source_system,
    record_type,
    record_id,
    version_number,
    content_hash,
    timestamp,
  ].join("|");
  return sha256(payload);
}

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
  const { data } = await api.get("/ledger/verify");
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

export async function verifyCheckpoint(checkpointId) {
  const { data } = await api.get(`/checkpoints/${checkpointId}/verify`);
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

// ---------- Mock Data & Fallback Generators ----------

export function getMockRecords() {
  const now = Date.now();
  return [
    {
      id: 1,
      source_system: "finance-erp",
      record_type: "invoice",
      record_id: "INV-2026-001",
      version_number: 1,
      content_hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      entry_hash: "a4c2810f279d396d11a84f3e6912389146ecba8818f0cc30e9d6d357b98d02e1",
      previous_version_hash: null,
      previous_ledger_hash: "GENESIS",
      timestamp: now - 3600000 * 4,
      metadata: { amount: 14500.0, currency: "USD", department: "Operations" },
      created_at: new Date(now - 3600000 * 4).toISOString(),
    },
    {
      id: 2,
      source_system: "hr-portal",
      record_type: "employee_contract",
      record_id: "EMP-0842",
      version_number: 1,
      content_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      entry_hash: "82a9db4308c31e9c2be977f6b92f70b795648835848e3e4a2a11b626e5d0f19c",
      previous_version_hash: null,
      previous_ledger_hash: "a4c2810f279d396d11a84f3e6912389146ecba8818f0cc30e9d6d357b98d02e1",
      timestamp: now - 3600000 * 2,
      metadata: { role: "Principal Engineer", clearance: "Level 4" },
      created_at: new Date(now - 3600000 * 2).toISOString(),
    },
    {
      id: 3,
      source_system: "finance-erp",
      record_type: "invoice",
      record_id: "INV-2026-001",
      version_number: 2,
      content_hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      entry_hash: "3f82b7194f4a3e788bc5f6d7a46c31024b89ee3303d2e1c98495a89e90f3c051",
      previous_version_hash: "a4c2810f279d396d11a84f3e6912389146ecba8818f0cc30e9d6d357b98d02e1",
      previous_ledger_hash: "82a9db4308c31e9c2be977f6b92f70b795648835848e3e4a2a11b626e5d0f19c",
      timestamp: now - 1800000,
      metadata: { amount: 14500.0, currency: "USD", status: "SETTLED_WIRE" },
      created_at: new Date(now - 1800000).toISOString(),
    },
    {
      id: 4,
      source_system: "supply-chain",
      record_type: "manifest",
      record_id: "MNF-9901-X",
      version_number: 1,
      content_hash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
      entry_hash: "d9e830c2b1897d43ef81093c8b4172a59e30a049d564efc1348123da478201fe",
      previous_version_hash: null,
      previous_ledger_hash: "3f82b7194f4a3e788bc5f6d7a46c31024b89ee3303d2e1c98495a89e90f3c051",
      timestamp: now - 300000,
      metadata: { origin: "Warehouse-7", destination: "Node-Beta" },
      created_at: new Date(now - 300000).toISOString(),
    },
  ];
}

export function getMockVerification() {
  return {
    valid: true,
    total_records: 4,
    message: "Ledger is cryptographically valid — all hash links intact",
  };
}

export function getMockHealth() {
  return { status: "ok", total_hash_records: 4 };
}

export function getMockCheckpoints() {
  return [
    {
      id: 1,
      last_record_id: 4,
      ledger_hash: "d9e830c2b1897d43ef81093c8b4172a59e30a049d564efc1348123da478201fe",
      created_at: new Date().toISOString(),
    },
  ];
}

