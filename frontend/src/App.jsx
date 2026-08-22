import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import StatsBar from "./components/StatsBar.jsx";
import ChainVisualization from "./components/ChainVisualization.jsx";
import TamperLab from "./components/TamperLab.jsx";
import AddEntry from "./components/AddEntry.jsx";
import VerifyRecord from "./components/VerifyRecord.jsx";
import CheckpointButton from "./components/CheckpointButton.jsx";
import EntryList from "./components/EntryList.jsx";
import StatusBar from "./components/StatusBar.jsx";
import {
  listRecords,
  registerRecord,
  importRecords,
  verifyLedger,
  healthCheck,
  exportLedger,
  getMockRecords,
  getMockVerification,
  getMockHealth,
  sha256,
} from "./api.js";

export default function App() {
  const [records, setRecords] = useState([]);
  const [verifyResult, setVerifyResult] = useState(null);
  const [tamperedIds, setTamperedIds] = useState(new Set());
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState({ entry: false, verify: false, upload: false });
  const [mockMode, setMockMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [checkpointsCount, setCheckpointsCount] = useState(1);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

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

  // Single record register handler
  const handleRegister = async ({ source_system, record_type, record_id, content, metadata }) => {
    setLoading((s) => ({ ...s, entry: true }));
    try {
      await registerRecord({ source_system, record_type, record_id, content, metadata });
      await fetchRecords();
      setVerifyResult(null);
      setTamperedIds(new Set());
      showToast(`Proof registered for ${record_id}`);
    } catch {
      if (mockMode) {
        const prev = records[records.length - 1];
        const contentHash = await sha256(content);
        const entryHash = await sha256(`${prev ? prev.entry_hash : "GENESIS"}|${source_system}|${record_type}|${record_id}|${contentHash}`);
        
        // Find existing record version if any
        const existingVersions = records.filter(
          (r) => r.source_system === source_system && r.record_type === record_type && r.record_id === record_id
        );
        const versionNumber = existingVersions.length + 1;
        const prevVerHash = existingVersions.length > 0 ? existingVersions[existingVersions.length - 1].entry_hash : null;

        const newRecord = {
          id: records.length + 1,
          source_system,
          record_type,
          record_id,
          version_number: versionNumber,
          content_hash: contentHash,
          entry_hash: entryHash,
          previous_version_hash: prevVerHash,
          previous_ledger_hash: prev ? prev.entry_hash : "GENESIS",
          timestamp: Date.now(),
          metadata: metadata || null,
          created_at: new Date().toISOString(),
        };

        setRecords((r) => [...r, newRecord]);
        setHealth((h) => (h ? { ...h, total_hash_records: h.total_hash_records + 1 } : getMockHealth()));
        showToast(`[Mock] Proof registered for ${record_id}`);
      }
    } finally {
      setLoading((s) => ({ ...s, entry: false }));
    }
  };

  // Batch import handler
  const handleBatchImport = async ({ source_system, record_type, records: batchItems }) => {
    setLoading((s) => ({ ...s, upload: true }));
    try {
      await importRecords({ source_system, record_type, records: batchItems });
      await fetchRecords();
      setVerifyResult(null);
      setTamperedIds(new Set());
      showToast(`Batch of ${batchItems.length} records imported`);
    } catch {
      if (mockMode) {
        let currentChain = [...records];
        let lastHash = currentChain.length > 0 ? currentChain[currentChain.length - 1].entry_hash : "GENESIS";

        for (let i = 0; i < batchItems.length; i++) {
          const item = batchItems[i];
          const cHash = await sha256(item.content);
          const eHash = await sha256(`${lastHash}|${source_system}|${record_type}|${item.record_id}|${cHash}`);
          const newBlock = {
            id: currentChain.length + 1,
            source_system,
            record_type,
            record_id: item.record_id,
            version_number: 1,
            content_hash: cHash,
            entry_hash: eHash,
            previous_version_hash: null,
            previous_ledger_hash: lastHash,
            timestamp: Date.now() + i * 100,
            metadata: item.metadata || null,
            created_at: new Date().toISOString(),
          };
          currentChain.push(newBlock);
          lastHash = eHash;
        }

        setRecords(currentChain);
        showToast(`[Mock] Batch of ${batchItems.length} records imported`);
      }
    } finally {
      setLoading((s) => ({ ...s, upload: false }));
    }
  };

  // Run full ledger verification
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

  // Simulate tampering in the lab
  const handleSimulateTamper = (targetId) => {
    const ids = new Set();
    for (let i = targetId; i <= records.length; i++) {
      ids.add(i);
    }
    setTamperedIds(ids);
    setVerifyResult({
      valid: false,
      tampered_at: targetId,
      total_records: records.length,
      message: `Cryptographic failure detected: Hash mismatch at Block #${targetId}`,
    });
    showToast(`Simulation: Tampering applied to Block #${targetId}`);
  };

  // Reset tampering
  const handleResetTamper = () => {
    setTamperedIds(new Set());
    setVerifyResult({
      valid: true,
      total_records: records.length,
      message: "Ledger is valid and clean",
    });
    showToast("Clean ledger state restored");
  };

  // Export JSON ledger
  const handleExport = async () => {
    try {
      let dataToExport = records;
      try {
        dataToExport = await exportLedger();
      } catch {
        dataToExport = records;
      }
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToExport, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `hashlog-ledger-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Ledger JSON export downloaded");
    } catch {
      showToast("Export failed");
    }
  };

  const latestHash = records.length > 0 ? records[records.length - 1].entry_hash : null;

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0ece9]">
      {/* Fixed Header */}
      <Header
        entryCount={records.length}
        chainValid={verifyResult?.valid ?? null}
        onExport={handleExport}
      />

      {/* Hero Section */}
      <Hero
        recordCount={records.length}
        latestHash={latestHash}
        onVerifyClick={handleVerifyLedger}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] border border-[#2e2e2e] text-[#f0ece9] px-4 py-2.5 rounded-[6px] shadow-2xl font-mono text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c9793f]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Telemetry Overview */}
      <StatsBar
        recordCount={records.length}
        verifyResult={verifyResult}
        latestHash={latestHash}
        checkpointsCount={checkpointsCount}
        mockMode={mockMode}
      />

      {/* Main Studio Components */}
      <main className="space-y-4">
        {/* Visual Proof Chain Graph */}
        <ChainVisualization records={records} tamperedIds={tamperedIds} />

        {/* Interactive Tamper Lab */}
        <TamperLab
          records={records}
          onSimulateTamper={handleSimulateTamper}
          onResetTamper={handleResetTamper}
          tamperedIds={tamperedIds}
        />

        {/* Register & Batch Ingest Studio */}
        <AddEntry
          onSubmit={handleRegister}
          onBatchSubmit={handleBatchImport}
          loading={loading.entry || loading.upload}
        />

        {/* Verification Studio */}
        <VerifyRecord
          onRunFullVerify={handleVerifyLedger}
          ledgerResult={verifyResult}
          ledgerLoading={loading.verify}
        />

        {/* Checkpoints Studio */}
        <CheckpointButton
          onCheckpointAdded={() => setCheckpointsCount((c) => c + 1)}
        />

        {/* Full Immutable Audit Explorer */}
        <EntryList records={records} tamperedIds={tamperedIds} />
      </main>

      {/* Footer Status Bar */}
      <StatusBar
        health={health}
        mockMode={mockMode}
        onRefresh={() => {
          fetchRecords();
          fetchHealth();
        }}
      />
    </div>
  );
}

