import { useState } from "react";
import { FiAlertTriangle, FiZap } from "react-icons/fi";
import { simulateTamper, revertTamper } from "../api.js";

export default function TamperLab({ records, onTamperApplied, onMessage }) {
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [tamperedId, setTamperedId] = useState(null);

  const applyTamper = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const result = await simulateTamper(Number(selectedId));
      onMessage?.(result.message);
      setTamperedId(Number(selectedId));
      onTamperApplied?.();
    } catch (error) {
      onMessage?.(error?.response?.data?.detail || "Tamper simulation is disabled");
    } finally {
      setLoading(false);
    }
  };

  const revert = async () => {
    if (!tamperedId) return;
    setLoading(true);
    try {
      const result = await revertTamper(tamperedId);
      onMessage?.(result.message);
      setTamperedId(null);
      onTamperApplied?.();
    } catch (error) {
      onMessage?.(error?.response?.data?.detail || "Could not revert tamper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="tamper-lab" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      <div className="instrument-card p-6 space-y-4 border-red-900/40">
        <div className="flex items-center gap-2 text-red-400">
          <FiAlertTriangle className="w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold">Development Tamper Lab</span>
        </div>
        <p className="font-mono text-xs text-[#8a8480] max-w-3xl">
          Intentionally changes one stored hash so the audit can prove that an unknown database edit is detected.
          This never changes or stores the original external file.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="flex-1 bg-[#080808] border border-[#2e2e2e] rounded-[4px] px-3 py-2 font-mono text-xs text-[#f0ece9]">
            <option value="">Choose a proof block to corrupt</option>
            {records.map((record) => (
              <option key={record.id} value={record.id}>#{record.id} — {record.record_id} (v{record.version_number})</option>
            ))}
          </select>
          <button type="button" disabled={!selectedId || loading} onClick={applyTamper} className="inline-flex items-center justify-center gap-2 bg-red-950/50 border border-red-800/70 text-red-300 hover:bg-red-900/60 disabled:opacity-40 px-4 py-2 rounded-[4px] font-mono text-xs uppercase">
            <FiZap className="w-3.5 h-3.5" /> {loading ? "Applying..." : "Simulate tamper"}
          </button>
          <button type="button" disabled={!tamperedId || loading} onClick={revert} className="inline-flex items-center justify-center gap-2 bg-emerald-950/40 border border-emerald-800/70 text-emerald-300 hover:bg-emerald-900/50 disabled:opacity-40 px-4 py-2 rounded-[4px] font-mono text-xs uppercase">
            Revert to true state
          </button>
        </div>
        <div className="font-mono text-[10px] text-[#8a8480]">After clicking, run “Execute Full Ledger Audit” above.</div>
      </div>
    </section>
  );
}
