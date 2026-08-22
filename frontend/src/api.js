import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ---------- Entries ----------

export async function getEntries(limit = 100, offset = 0) {
  const { data } = await api.get("/entries", {
    params: { limit, offset },
  });
  return data;
}

export async function getEntry(id) {
  const { data } = await api.get(`/entries/${id}`);
  return data;
}

export async function createEntry({ data: entryData, user_id, file_hash }) {
  const payload = { data: entryData };
  if (user_id) payload.user_id = user_id;
  if (file_hash) payload.file_hash = file_hash;
  const { data } = await api.post("/entries", payload);
  return data;
}

// ---------- Verify ----------

export async function verifyChain() {
  const { data } = await api.get("/verify");
  return data;
}

// ---------- Export ----------

export async function exportLog() {
  const { data } = await api.get("/export");
  return data;
}

// ---------- Health ----------

export async function healthCheck() {
  const { data } = await api.get("/health");
  return data;
}

// ---------- Mock data for offline dev ----------

export function getMockEntries() {
  const now = Date.now();
  return [
    {
      id: 1,
      user_id: "alice",
      data: "User Alice generated invoice #1001",
      file_hash: null,
      timestamp: now - 120000,
      prev_hash: "GENESIS",
      entry_hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      nonce: 0,
      metadata: null,
      created_at: new Date(now - 120000).toISOString(),
    },
    {
      id: 2,
      user_id: "bob",
      data: "Payment of $500 received for invoice #1001",
      file_hash: null,
      timestamp: now - 60000,
      prev_hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      entry_hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
      nonce: 0,
      metadata: null,
      created_at: new Date(now - 60000).toISOString(),
    },
    {
      id: 3,
      user_id: "alice",
      data: "Invoice #1001 marked as paid",
      file_hash: null,
      timestamp: now,
      prev_hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
      entry_hash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      nonce: 0,
      metadata: null,
      created_at: new Date(now).toISOString(),
    },
  ];
}

export function getMockVerification() {
  return { valid: true, message: "Chain is valid" };
}
