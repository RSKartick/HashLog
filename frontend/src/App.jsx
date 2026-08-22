import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import AddEntry from "./components/AddEntry.jsx";
import FileUpload from "./components/FileUpload.jsx";
import VerifyRecord from "./components/VerifyRecord.jsx";
import VerifyButton from "./components/VerifyButton.jsx";
import CheckpointButton from "./components/CheckpointButton.jsx";
import EntryList from "./components/EntryList.jsx";
import ChainVisualization from "./components/ChainVisualization.jsx";
import StatusBar from "./components/StatusBar.jsx";
import {
  listRecords,
  registerRecord,
  importRecords,
  verifyLedger,
  healthCheck,
  getMockRecords,
  getMockVerification,
  getMockHealth,
} from "./api.js";

export default function App() {
  const [records, setRecords] = useState([]);
  const [verifyResult, setVerifyResult] = useState(null);
  const [tamperedIds, setTamperedIds] = useState(new Set());
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState({ entry: false, verify: false, upload: false });
  const [mockMode, setMockMode] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const data = await listRecords();
      const list = Array.isArray(data) ? data : [];
      setRecords(list);
      setMockMode(false);
    } catch {
      setRecords(getMockRecords());
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
    fetchRecords();
    fetchHealth();
  }, [fetchRecords, fetchHealth]);

  const handleRegister = async ({ source_system, record_type, record_id, content }) => {
    setLoading((s) => ({ ...s, entry: true }));
    try {
      await registerRecord({ source_system, record_type, record_id, content });
      await fetchRecords();
      setVerifyResult(null);
      setTamperedIds(new Set());
    } catch {
      if (mockMode) {
        const prev = records[records.length - 1];
        const hash = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const newRecord = {
          id: records.length + 1,
          source_system,
          record_type,
          record_id,
          version_number: 1,
          content_hash: Math.random().toString(36).slice(2),
          entry_hash: hash,
          previous_version_hash: null,
          previous_ledger_hash: prev ? prev.entry_hash : "GENESIS",
          timestamp: Date.now(),
          metadata: null,
          created_at: new Date().toISOString(),
        };
        setRecords((r) => [...r, newRecord]);
        setHealth((h) => h ? { ...h, total_hash_records: h.total_hash_records + 1 } : getMockHealth());
      }
    } finally {
      setLoading((s) => ({ ...s, entry: false }));
    }
  };

  const handleFileUpload = async ({ source_system, record_type, records: importRecords }) => {
    setLoading((s) => ({ ...s, upload: true }));
    try {
      await importRecords({ source_system, record_type, records: importRecords });
      await fetchRecords();
      setVerifyResult(null);
      setTamperedIds(new Set());
    } catch {
      if (mockMode) {
        setRecords((prev) => {
          const next = [...prev];
          let lastHash = next.length > 0 ? next[next.length - 1].entry_hash : "GENESIS";
          importRecords.forEach((rec, i) => {
            const hash = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            next.push({
              id: next.length + 1,
              source_system,
              record_type,
              record_id: rec.record_id,
              version_number: 1,
              content_hash: Math.random().toString(36).slice(2),
              entry_hash: hash,
              previous_version_hash: null,
              previous_ledger_hash: lastHash,
              timestamp: Date.now() + i,
              metadata: rec.metadata || null,
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

  const handleVerifyLedger = async () => {
    setLoading((s) => ({ ...s, verify: true }));
    try {
      const result = await verifyLedger();
      setVerifyResult(result);
      if (!result.valid && result.tampered_at) {
        const ids = new Set();
        for (let i = result.tampered_at; i <= records.length; i++) ids.add(i);
        setTamperedIds(ids);
      } else {
        setTamperedIds(new Set());
      }
    } catch {
      const result = getMockVerification();
      setVerifyResult(result);
      setTamperedIds(new Set());
    } finally {
      setLoading((s) => ({ ...s, verify: false }));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header entryCount={records.length} chainValid={verifyResult?.valid ?? null} />

      <Hero recordCount={records.length} />

      <main id="actions" className="mx-auto max-w-3xl px-6 pb-12 space-y-6">
        {mockMode && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700/40 bg-zinc-900/40 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <span>
              Backend offline — using local mock data. Start the API to persist records.
            </span>
          </div>
        )}

        <AddEntry onSubmit={handleRegister} loading={loading.entry} />
        <FileUpload onUpload={handleFileUpload} loading={loading.upload} />

        <ChainVisualization records={records} tamperedIds={tamperedIds} />

        <VerifyButton
          onClick={handleVerifyLedger}
          loading={loading.verify}
          result={verifyResult}
        />

        <VerifyRecord loading={loading.verify} />

        <CheckpointButton />

        <EntryList records={records} tamperedIds={tamperedIds} />

        <StatusBar health={health} onRefresh={() => { fetchRecords(); fetchHealth(); }} />
      </main>
    </div>
  );
}
