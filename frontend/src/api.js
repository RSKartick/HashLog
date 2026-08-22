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
  const { data } = await api.get("/ledger/verify");
  return data;
}

export async function simulateTamper(recordDbId) {
  const { data } = await api.post("/dev/tamper", { record_db_id: recordDbId });
  return data;
}

export async function revertTamper(recordDbId) {
  const { data } = await api.post("/dev/tamper/revert", { record_db_id: recordDbId });
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



