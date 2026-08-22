import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import AddEntry from "./components/AddEntry.jsx";
import FileUpload from "./components/FileUpload.jsx";
import EntryList from "./components/EntryList.jsx";
import ChainVisualization from "./components/ChainVisualization.jsx";
import VerifyButton from "./components/VerifyButton.jsx";
import StatusBar from "./components/StatusBar.jsx";
import {
  getEntries,
  createEntry,
  verifyChain,
  healthCheck,
  getMockEntries,
  getMockVerification,
} from "./api.js";

export default function App() {
  const [entries, setEntries] = useState([]);
  const [verifyResult, setVerifyResult] = useState(null);
  const [tamperedIds, setTamperedIds] = useState(new Set());
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState({ entry: false, verify: false, upload: false });
  const [mockMode, setMockMode] = useState(false);

  // --- fetch helpers ---

  const fetchEntries = useCallback(async () => {
    try {
      const data = await getEntries();
      const list = Array.isArray(data) ? data : data.entries ?? [];
      setEntries(list);
      setMockMode(false);
    } catch {
      // backend offline — use mock data
      setEntries(getMockEntries());
      setMockMode(true);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await healthCheck();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchHealth();
  }, [fetchEntries, fetchHealth]);

  // --- actions ---

  const handleCreate = async ({ data, user_id }) => {
    setLoading((s) => ({ ...s, entry: true }));
    try {
      await createEntry({ data, user_id });
      await fetchEntries();
      setVerifyResult(null);
      setTamperedIds(new Set());
    } catch {
      // in mock mode, just add locally
      if (mockMode) {
        const prev = entries[entries.length - 1];
        const newEntry = {
          id: entries.length + 1,
          user_id: user_id || null,
          data,
          file_hash: null,
          timestamp: Date.now(),
          prev_hash: prev ? prev.entry_hash : "GENESIS",
          entry_hash: Math.random().toString(36).slice(2),
          nonce: 0,
          metadata: null,
          created_at: new Date().toISOString(),
        };
        setEntries((e) => [...e, newEntry]);
      }
    } finally {
      setLoading((s) => ({ ...s, entry: false }));
    }
  };

  const handleVerify = async () => {
    setLoading((s) => ({ ...s, verify: true }));
    try {
      const result = await verifyChain();
      setVerifyResult(result);
      if (!result.valid && result.tampered_at) {
        const ids = new Set();
        for (let i = result.tampered_at; i <= entries.length; i++) ids.add(i);
        setTamperedIds(ids);
      } else {
        setTamperedIds(new Set());
      }
    } catch {
      // mock verification
      const result = getMockVerification();
      setVerifyResult(result);
      setTamperedIds(new Set());
    } finally {
      setLoading((s) => ({ ...s, verify: false }));
    }
  };

  const handleFileUpload = async (parsedEntries) => {
    setLoading((s) => ({ ...s, upload: true }));
    try {
      for (const entry of parsedEntries) {
        const payload = {
          data: typeof entry.data === "string" ? entry.data : JSON.stringify(entry.data),
          user_id: entry.user_id || undefined,
          file_hash: entry.file_hash || undefined,
        };
        await createEntry(payload);
      }
      await fetchEntries();
      setVerifyResult(null);
      setTamperedIds(new Set());
    } catch {
      // mock mode — append locally
      if (mockMode) {
        setEntries((prev) => {
          const next = [...prev];
          let lastHash = next.length > 0 ? next[next.length - 1].entry_hash : "GENESIS";
          parsedEntries.forEach((entry, i) => {
            const data = typeof entry.data === "string" ? entry.data : JSON.stringify(entry.data);
            const hash = Math.random().toString(36).slice(2);
            next.push({
              id: next.length + 1,
              user_id: entry.user_id || null,
              data,
              file_hash: entry.file_hash || null,
              timestamp: Date.now() + i,
              prev_hash: lastHash,
              entry_hash: hash,
              nonce: entry.nonce ?? 0,
              metadata: entry.metadata || null,
              created_at: new Date().toISOString(),
            });
            lastHash = hash;
          });
          return next;
        });
      }
    } finally {
      setLoading((s) => ({ ...s, upload: false }));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header entryCount={entries.length} chainValid={verifyResult?.valid ?? null} />

      <Hero entryCount={entries.length} />

      <main id="actions" className="mx-auto max-w-3xl px-6 pb-12 space-y-6">
        {/* Mock mode banner */}
        {mockMode && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700/40 bg-zinc-900/40 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <span>
              Backend offline — using local mock data. Start the API to persist
              entries.
            </span>
          </div>
        )}

        <AddEntry onSubmit={handleCreate} loading={loading.entry} />
        <FileUpload onUpload={handleFileUpload} loading={loading.upload} />

        <ChainVisualization entries={entries} tamperedIds={tamperedIds} />

        <VerifyButton
          onClick={handleVerify}
          loading={loading.verify}
          result={verifyResult}
        />

        <EntryList entries={entries} tamperedIds={tamperedIds} />

        <StatusBar health={health} onRefresh={() => { fetchEntries(); fetchHealth(); }} />
      </main>
    </div>
  );
}
