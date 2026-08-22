import { useState } from "react";
import { FiAlertOctagon, FiRefreshCw, FiZap, FiCheck, FiArrowRight, FiShield, FiAlertTriangle } from "react-icons/fi";
import { sha256 } from "../api.js";

export default function TamperLab({ records, onSimulateTamper, onResetTamper, tamperedIds }) {
  const [selectedRecordId, setSelectedRecordId] = useState(records[1]?.id || records[0]?.id || 1);
  const [tamperedPayload, setTamperedPayload] = useState('{"amount": 999999.0, "status": "FRAUDULENT_TRANSFER"}');
  const [simulatedContentHash, setSimulatedContentHash] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const handleComputeSimulatedHash = async (text) => {
    setTamperedPayload(text);
    if (!text.trim()) {
      setSimulatedContentHash("");
      return;
    }
    try {
      const hash = await sha256(text);
      setSimulatedContentHash(hash);
    } catch {
      setSimulatedContentHash("");
    }
  };

  const handleApplyTamper = () => {
    if (!selectedRecordId) return;
    setIsSimulating(true);
    onSimulateTamper(Number(selectedRecordId));
  };

  const handleReset = () => {
    setIsSimulating(false);
    onResetTamper();
  };

  const selectedRecord = records.find((r) => r.id === Number(selectedRecordId)) || records[0];

  return (
    <section id="tamper-lab" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 border-t border-[#1a1a1a]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] block mb-1">
            INTERACTIVE SECURITY LAB
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            Tamper Simulation & Proof Cascade
          </h2>
        </div>
        <p className="font-mono text-xs text-[#8a8480] max-w-md">
          Simulate how modifying a single external record or in-chain proof breaks mathematical integrity downstream.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tamper Control Panel */}
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-[#242424] rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-[#1f1f1f]">
              <FiAlertOctagon className="w-4 h-4 text-[#c9793f]" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#f0ece9] font-semibold">
                Simulate Payload Alteration
              </span>
            </div>

            {/* Target block selector */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-[#8a8480] uppercase mb-2">
                Target Block to Compromise:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {records.map((rec) => {
                  const isCompromised = tamperedIds && tamperedIds.has(rec.id);
                  const isSelected = Number(selectedRecordId) === rec.id;
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => {
                        setSelectedRecordId(rec.id);
                        handleComputeSimulatedHash(tamperedPayload);
                      }}
                      className={`p-2.5 rounded-[6px] border font-mono text-xs text-left transition-all ${
                        isSelected
                          ? "border-[#c9793f] bg-[#1a1410] text-[#f0ece9]"
                          : isCompromised
                          ? "border-red-800/60 bg-red-950/20 text-red-400"
                          : "border-[#1f1f1f] bg-[#111111] text-[#b8b2ae] hover:border-[#2e2e2e]"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>Block #{rec.id}</span>
                        {isCompromised && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                      </div>
                      <div className="text-[10px] text-[#8a8480] truncate mt-0.5">
                        {rec.record_id}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated rogue modification */}
            <div className="mb-4">
              <label className="block font-mono text-xs text-[#8a8480] uppercase mb-2">
                External System Modified Data (Payload):
              </label>
              <textarea
                value={tamperedPayload}
                onChange={(e) => handleComputeSimulatedHash(e.target.value)}
                rows={3}
                className="w-full bg-[#080808] border border-[#242424] focus:border-[#c9793f] focus:outline-none rounded-[6px] p-3 font-mono text-xs text-[#f0ece9] resize-none"
                placeholder="Enter altered data..."
              />
            </div>

            {/* Live Calculated Mismatch Preview */}
            <div className="bg-[#080808] border border-[#1f1f1f] rounded-[6px] p-3 mb-6 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#8a8480]">
                <span>Original Registered Hash:</span>
                <span className="text-[#b8b2ae] truncate max-w-[200px]">
                  {selectedRecord?.content_hash || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400">Tampered Content Hash:</span>
                <span className="text-red-400 truncate max-w-[200px] font-semibold">
                  {simulatedContentHash || "9f86d081884c7d659a2feaa0c55ad..."}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1f1f1f]">
            <button
              onClick={handleApplyTamper}
              className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-black bg-red-400 hover:bg-red-300 px-5 py-3 rounded-[6px] transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <FiZap className="w-4 h-4" />
              <span>Simulate Tamper on #{selectedRecordId}</span>
            </button>

            {tamperedIds && tamperedIds.size > 0 && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-[#b8b2ae] hover:text-[#f0ece9] bg-[#111111] hover:bg-[#161616] border border-[#242424] px-4 py-3 rounded-[6px] transition-colors"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Restore Clean State</span>
              </button>
            )}
          </div>
        </div>

        {/* Diagnostic Breakdown Card */}
        <div className="lg:col-span-5 bg-[#0a0a0a] border border-[#242424] rounded-[10px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1f1f1f]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#f0ece9] font-semibold">
                Cryptographic Cascade Explanation
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#161616] border border-[#242424] text-[#8a8480]">
                AVALANCHE EFFECT
              </span>
            </div>

            <div className="space-y-4 text-xs text-[#b8b2ae] leading-relaxed">
              <p>
                In HashLog, each block computes its <code className="text-[#c9793f]">entry_hash</code> from both its own content hash AND the <code className="text-[#c9793f]">previous_ledger_hash</code>.
              </p>

              <div className="p-3 bg-[#080808] border border-[#1f1f1f] rounded-[6px] font-mono text-[11px] space-y-1 text-[#8a8480]">
                <div>entry_hash = SHA256(</div>
                <div className="pl-4 text-[#b8b2ae]">prev_version_hash | prev_ledger_hash |</div>
                <div className="pl-4 text-[#b8b2ae]">source | type | id | version | <span className="text-red-400 font-bold">content_hash</span> | time</div>
                <div>)</div>
              </div>

              {tamperedIds && tamperedIds.size > 0 ? (
                <div className="p-3.5 bg-red-950/30 border border-red-800/60 rounded-[6px] text-red-300 space-y-1">
                  <div className="flex items-center gap-2 font-mono font-semibold text-red-400">
                    <FiAlertTriangle className="w-4 h-4" />
                    <span>Cascade Detected!</span>
                  </div>
                  <p className="text-[11px] text-red-200/80">
                    Tampering Block #{Array.from(tamperedIds)[0]} immediately invalidates all subsequent blocks ({Array.from(tamperedIds).join(", ")}) because downstream ledger hashes no longer link.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/60 rounded-[6px] text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2 font-mono font-semibold text-emerald-400">
                    <FiCheck className="w-4 h-4" />
                    <span>Ledger Pristine</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80">
                    All linear ledger hashes match the exact SHA-256 chain sequence.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1f1f1f] text-[11px] font-mono text-[#5a5654]">
            Zero-Knowledge Guarantee: Raw payload data remains in your source database; only proof hashes travel to HashLog.
          </div>
        </div>
      </div>
    </section>
  );
}
