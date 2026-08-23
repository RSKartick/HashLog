import { useState } from "react";
import { FiAlertTriangle, FiClock, FiZap } from "react-icons/fi";
import { simulateTamper, revertTamper, listCheckpoints, verifyCheckpoint } from "../api.js";

export default function TamperLab({ records, onTamperApplied, onMessage }) {
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [tamperedIds, setTamperedIds] = useState(new Set());
  const [attackReport, setAttackReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const selectedRecord = records.find((record) => String(record.id) === selectedId);
  const breachActive = tamperedIds.size > 0;

  const displayContent = (value) => typeof value === "string" ? value : JSON.stringify(value ?? "", null, 2);

  const addTimeline = (label, status = "warning") => setTimeline((items) => [
    ...items,
    { label, status, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);

  const applyTamper = async () => {
    if (!selectedRecord) return;
    if (breachActive) {
      onMessage?.("Restore the current breach before starting another attack");
      return;
    }
    setLoading(true);
    setTimeline([]);
    const trustedHash = selectedRecord.content_hash;
    try {
      addTimeline("Record modified", "warning");
      const result = await simulateTamper(selectedRecord.id);
      setTamperedIds(new Set([selectedRecord.id]));
      const originalContent = displayContent(selectedRecord.raw_content);
      const tamperedContent = "[TAMPERED DATABASE CONTENT]";
      const originalLines = originalContent.split(/\r?\n/);
      const tamperedLines = tamperedContent.split(/\r?\n/);
      const changedLines = Array.from({ length: Math.max(originalLines.length, tamperedLines.length) }, (_, index) => ({
        number: index + 1,
        original: originalLines[index] ?? "",
        current: tamperedLines[index] ?? "",
      })).filter((line) => line.original !== line.current);
      setAttackReport({ recordId: selectedRecord.record_id, block: selectedRecord.id, trustedHash: result.trusted_hash || trustedHash, actualHash: result.actual_hash || "unknown", originalContent, tamperedContent, changedLines });
      addTimeline("Hash mismatch detected", "warning");
      addTimeline(`Ledger link broken at block #${selectedRecord.id}`, "danger");
      const checkpoints = await listCheckpoints();
      if (checkpoints.length === 0) {
        addTimeline("No external checkpoint exists to verify", "warning");
      } else {
        const results = await Promise.all(checkpoints.map((checkpoint) => verifyCheckpoint(checkpoint.id)));
        addTimeline(results.some((item) => !item.valid) ? "Checkpoint verification rejected" : "Checkpoint still valid at its boundary", results.some((item) => !item.valid) ? "danger" : "success");
      }
      onMessage?.(result.message);
      await onTamperApplied?.();
    } catch (error) {
      onMessage?.(error?.response?.data?.detail || "Tamper simulation is disabled");
    } finally {
      setLoading(false);
    }
  };

  const revert = async () => {
    if (!breachActive || loading) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        Array.from(tamperedIds).map((id) => revertTamper(id).catch((error) => ({ error, id })))
      );
      const failures = results.filter((item) => item?.error);
      setTamperedIds(new Set());
      setAttackReport(null);
      if (failures.length === 0) {
        addTimeline("Original proof restored", "success");
        onMessage?.("Original proof restored");
      } else {
        addTimeline("Some proofs could not be restored — refresh and retry", "danger");
        onMessage?.(failures[0].error?.response?.data?.detail || "Could not revert every tamper");
      }
      await onTamperApplied?.();
    } catch (error) {
      onMessage?.(error?.response?.data?.detail || "Could not revert tamper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="tamper-lab" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      <div className="instrument-card p-6 space-y-5 border-red-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400"><FiAlertTriangle className="w-4 h-4" /><span className="font-mono text-xs uppercase tracking-wider font-semibold">Development Attack Simulator</span></div>
          <span className="font-mono text-[9px] uppercase text-red-300 border border-red-800/60 bg-red-950/30 px-2 py-1 rounded">Demo mode</span>
        </div>
        <p className="font-mono text-xs text-[#8a8480] max-w-3xl">Simulates an unknown database edit by corrupting one stored proof hash. The audit then detects the mismatch and breaks the ledger link.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={breachActive ? "" : selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={breachActive} className="flex-1 bg-[#080808] border border-[#2e2e2e] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9] disabled:opacity-50">{breachActive ? <option value="">Breach active on block #{[...tamperedIds].join(", #")} — restore first</option> : <option value="">Choose a proof block to attack</option>}{!breachActive && records.map((record) => <option key={record.id} value={record.id}>#{record.id} — {record.record_id} (v{record.version_number})</option>)}</select>
          <button type="button" disabled={!selectedRecord || loading || breachActive} onClick={applyTamper} title={breachActive ? "Restore the current breach first" : undefined} className="inline-flex items-center justify-center gap-2 bg-red-950/60 border border-red-700/80 text-red-200 hover:bg-red-900/70 disabled:opacity-40 px-5 py-2.5 rounded-[4px] font-mono text-xs uppercase font-semibold"><FiZap className="w-3.5 h-3.5" /> {loading ? "Attacking..." : "Simulate tamper attack"}</button>
          <button type="button" disabled={!breachActive || loading} onClick={revert} className="inline-flex items-center justify-center gap-2 bg-emerald-950/40 border border-emerald-800/70 text-emerald-300 hover:bg-emerald-900/50 disabled:opacity-40 px-4 py-2.5 rounded-[4px] font-mono text-xs uppercase">Revert true state</button>
        </div>

        {attackReport && <div className="border border-red-700/80 bg-red-950/30 rounded-[5px] p-5 space-y-4 shadow-[0_0_25px_rgba(239,68,68,0.12)]">
          <div className="flex items-center gap-2 text-red-300 font-mono text-sm font-semibold uppercase"><FiAlertTriangle className="w-5 h-5" /> Integrity violation detected</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs"><div><span className="text-[#8a8480]">Record:</span> <span className="text-[#f0ece9]">{attackReport.recordId}</span></div><div><span className="text-[#8a8480]">Proof field:</span> <span className="text-red-300">content_hash</span></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px]"><div className="bg-[#050505] border border-[#3a2020] p-3"><div className="text-[#8a8480]">EXPECTED TRUSTED HASH</div><div className="text-emerald-300 break-all mt-1">{attackReport.trustedHash}</div></div><div className="bg-[#050505] border border-[#3a2020] p-3"><div className="text-[#8a8480]">ACTUAL DATABASE HASH</div><div className="text-red-300 break-all mt-1">{attackReport.actualHash}</div></div></div>
          <div className="font-mono text-xs text-red-300 border-t border-red-900/60 pt-3">LEDGER LINK BROKEN AT BLOCK #{attackReport.block}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><div className="font-mono text-[10px] uppercase text-[#8a8480] mb-1">Trusted original log</div><pre className="max-h-56 overflow-auto whitespace-pre-wrap bg-[#050505] border border-[#3a2020] p-3 text-[10px] text-emerald-300">{attackReport.originalContent}</pre></div><div><div className="font-mono text-[10px] uppercase text-[#8a8480] mb-1">Tampered log</div><pre className="max-h-56 overflow-auto whitespace-pre-wrap bg-[#050505] border border-[#3a2020] p-3 text-[10px] text-red-300">{attackReport.tamperedContent}</pre></div></div>
          <div className="font-mono text-[10px] text-[#8a8480]">Changed lines: <span className="text-red-300">{attackReport.changedLines.length}</span></div>
          <div className="space-y-1 font-mono text-[10px]">{attackReport.changedLines.slice(0, 25).map((line) => <div key={line.number} className="bg-[#111111] p-1.5"><span className="text-[#c9793f] mr-2">Line {line.number}</span><span className="text-red-300">- {line.original || "(removed)"}</span><span className="mx-2 text-[#8a8480]">→</span><span className="text-emerald-300">+ {line.current || "(added)"}</span></div>)}</div>
          <div className="font-mono text-[10px] text-[#8a8480]">This demo changes the persisted raw snapshot and recalculates its content hash while leaving the chain entry stale, reproducing a real content-tamper scenario.</div>
        </div>}

        {timeline.length > 0 && <div className="border border-[#2e2e2e] bg-[#080808] rounded-[5px] p-5"><div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#c9793f] mb-4"><FiClock /> Trust timeline</div><div className="space-y-3 border-l border-[#3a2a20] ml-2 pl-5">{timeline.map((event, index) => <div key={`${event.time}-${index}`} className="relative flex items-center justify-between gap-3 font-mono text-[11px]"><span className="absolute -left-[26px] w-2.5 h-2.5 rounded-full border-2 border-[#080808] bg-[#c9793f]" /><span className={event.status === "success" ? "text-emerald-300" : event.status === "danger" ? "text-red-300" : "text-amber-300"}>{event.label}</span><span className="text-[#5a5654]">{event.time}</span></div>)}</div></div>}
      </div>
    </section>
  );
}
