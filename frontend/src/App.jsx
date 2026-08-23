import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import StatsBar from "./components/StatsBar.jsx";
import ChainVisualization from "./components/ChainVisualization.jsx";
import Timeline from "./components/Timeline.jsx";
import AddEntry from "./components/AddEntry.jsx";
import VerifyRecord from "./components/VerifyRecord.jsx";
import CheckpointButton from "./components/CheckpointButton.jsx";
import EntryList from "./components/EntryList.jsx";
import StatusBar from "./components/StatusBar.jsx";
import TamperLab from "./components/TamperLab.jsx";
import CaptchaGate from "./components/CaptchaGate.jsx";
import {
  listRecords,
  registerRecord,
  importRecords,
  verifyLedger,
  healthCheck,
  exportLedger,
} from "./api.js";

export default function App() {
  const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const [captchaVerified, setCaptchaVerified] = useState(() => {
    if (!captchaSiteKey) return true;
    return window.localStorage.getItem("hashlog_captcha_verified") === "true";
  });
  const [records, setRecords] = useState([]);
  const [verifyResult, setVerifyResult] = useState(null);
  const [tamperedIds, setTamperedIds] = useState(new Set());
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState({ entry: false, verify: false, upload: false });
  const [toast, setToast] = useState(null);
  const [checkpointsCount, setCheckpointsCount] = useState(0);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [logSnapshots, setLogSnapshots] = useState({});

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rememberSnapshot = (sourceSystem, recordType, recordId, content) => {
    if (content === undefined || content === null) return;
    const key = `${sourceSystem}/${recordType}/${recordId}`;
    setLogSnapshots((current) => {
      const previous = current[key];
      const text = String(content);
      return { ...current, [key]: { original: previous?.original ?? text, current: text } };
    });
  };

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const data = await listRecords();
      const list = Array.isArray(data) ? data : [];
      setRecords(list);
      setLogSnapshots((current) => {
        const next = { ...current };
        [...list].sort((a, b) => a.version_number - b.version_number).forEach((record) => {
          if (record.raw_content === undefined || record.raw_content === null) return;
          const key = `${record.source_system}/${record.record_type}/${record.record_id}`;
          const text = typeof record.raw_content === "string" ? record.raw_content : JSON.stringify(record.raw_content, null, 2);
          next[key] = { original: next[key]?.original ?? text, current: text };
        });
        return next;
      });
      return list;
    } catch {
      setRecords([]);
      showToast("Failed to fetch ledger — check API connectivity");
      return [];
    } finally {
      setRecordsLoading(false);
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

  const handleRegister = async ({ source_system, record_type, record_id, content, metadata }) => {
    setLoading((s) => ({ ...s, entry: true }));
    try {
      await registerRecord({ source_system, record_type, record_id, content, metadata });
      rememberSnapshot(source_system, record_type, record_id, typeof content === "string" ? content : JSON.stringify(content, null, 2));
      await fetchRecords();
      setVerifyResult(null);
      setTamperedIds(new Set());
      showToast(`Proof registered for ${record_id}`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to register proof");
    } finally {
      setLoading((s) => ({ ...s, entry: false }));
    }
  };

  const handleBatchImport = async ({ source_system, record_type, records: batchItems }) => {
    setLoading((s) => ({ ...s, upload: true }));
    try {
      await importRecords({ source_system, record_type, records: batchItems });
      batchItems.forEach((item) => rememberSnapshot(source_system, record_type, item.record_id, item.content));
      await fetchRecords();
      setVerifyResult(null);
      setTamperedIds(new Set());
      showToast(`File proof registered: ${batchItems[0]?.record_id || "uploaded log"}`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Batch import failed");
    } finally {
      setLoading((s) => ({ ...s, upload: false }));
    }
  };

  const runAudit = async (list = records) => {
    setLoading((s) => ({ ...s, verify: true }));
    try {
      const result = await verifyLedger();
      setVerifyResult(result);
      if (!result.valid) {
        // Flag the tampered block and all downstream blocks that depend on it
        const tId = result.tampered_at != null ? result.tampered_at : (list[0]?.id ?? 1);
        const affected = new Set();
        list.forEach((r) => {
          if (Number(r.id) >= Number(tId)) {
            affected.add(r.id);
            affected.add(Number(r.id));
            affected.add(String(r.id));
          }
        });
        if (affected.size === 0 && list.length > 0) {
          affected.add(list[0].id);
        }
        setTamperedIds(affected);
      } else {
        setTamperedIds(new Set());
      }
      return result;
    } catch (err) {
      showToast(err?.response?.data?.detail || "Ledger verification failed");
      return null;
    } finally {
      setLoading((s) => ({ ...s, verify: false }));
    }
  };

  const handleVerifyLedger = () => runAudit();

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await fetchRecords();
      if (!alive || list.length === 0) return;
      await runAudit(list); // accurate Integrity Status on first paint
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRecords]);

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

  const handleTamperApplied = async (tamperedBlockId) => {
    if (tamperedBlockId != null) {
      const affected = new Set();
      records.forEach((r) => {
        if (Number(r.id) >= Number(tamperedBlockId)) {
          affected.add(r.id);
          affected.add(Number(r.id));
          affected.add(String(r.id));
        }
      });
      if (affected.size === 0) {
        affected.add(tamperedBlockId);
      }
      setTamperedIds(affected);
    }
    const list = await fetchRecords();
    await runAudit(list);
  };

  const handleAuthorizedVersion = async () => {
    const list = await fetchRecords();
    await runAudit(list);
  };

  const handleCurrentLogObserved = (sourceSystem, recordType, recordId, content) => {
    rememberSnapshot(sourceSystem, recordType, recordId, content);
  };

  const latestHash = records.length > 0 ? records[records.length - 1].entry_hash : null;
  const isLedgerTampered = Boolean(verifyResult && !verifyResult.valid) || tamperedIds.size > 0;

  return (
    <div className="min-h-screen bg-[#000000] text-[#f0ece9]">
      {captchaSiteKey && !captchaVerified && (
        <CaptchaGate siteKey={captchaSiteKey} onVerified={() => setCaptchaVerified(true)} />
      )}
      <Header
        entryCount={records.length}
        chainValid={verifyResult?.valid ?? null}
        onExport={handleExport}
      />

      <Hero
        recordCount={records.length}
        latestHash={latestHash}
        onVerifyClick={handleVerifyLedger}
        isTampered={isLedgerTampered}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] border border-[#2e2e2e] text-[#f0ece9] px-4 py-2.5 rounded-[6px] shadow-2xl font-mono text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c9793f]" />
          <span>{toast}</span>
        </div>
      )}

      <StatsBar
        recordCount={records.length}
        verifyResult={verifyResult}
        latestHash={latestHash}
        checkpointsCount={checkpointsCount}
      />

      <main className="space-y-4">
        <ChainVisualization records={records} tamperedIds={tamperedIds} logSnapshots={logSnapshots} />

        <Timeline records={records} />

        <AddEntry
          onSubmit={handleRegister}
          onBatchSubmit={handleBatchImport}
          loading={loading.entry || loading.upload}
        />

        <VerifyRecord
          onRunFullVerify={handleVerifyLedger}
          ledgerResult={verifyResult}
          ledgerLoading={loading.verify}
          onMessage={showToast}
          onAuthorizedVersion={handleAuthorizedVersion}
          onCurrentLogObserved={handleCurrentLogObserved}
          logSnapshots={logSnapshots}
        />

        <TamperLab
          records={records}
          onTamperApplied={handleTamperApplied}
          onMessage={showToast}
        />

        <CheckpointButton
          onCheckpointCountChange={setCheckpointsCount}
        />

        <EntryList records={records} tamperedIds={tamperedIds} loading={recordsLoading} logSnapshots={logSnapshots} />
      </main>

      <StatusBar
        health={health}
        onRefresh={() => {
          fetchRecords();
          fetchHealth();
        }}
      />
    </div>
  );
}
