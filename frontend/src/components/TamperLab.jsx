import { useState, useMemo } from "react";
import { FiAlertOctagon, FiRefreshCw, FiZap, FiCheck, FiArrowRight, FiShield, FiAlertTriangle, FiCpu, FiHash } from "react-icons/fi";
import { sha256 } from "../api.js";

export default function TamperLab({ records, onSimulateTamper, onResetTamper, tamperedIds }) {
  const [selectedRecordId, setSelectedRecordId] = useState(records[1]?.id || records[0]?.id || 1);
  const [tamperedPayload, setTamperedPayload] = useState('{"amount": 999999.0, "status": "FRAUDULENT_TRANSFER"}');
  const [simulatedContentHash, setSimulatedContentHash] = useState("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");

  const selectedRecord = records.find((r) => r.id === Number(selectedRecordId)) || records[0];

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

  const originalHash = selectedRecord?.content_hash || "";

  // Character-by-character hex diff metrics
  const hexDiffStats = useMemo(() => {
    if (!originalHash || !simulatedContentHash) return { diffCount: 0, percent: 0 };
    let diffs = 0;
    const len = Math.max(originalHash.length, simulatedContentHash.length);
    for (let i = 0; i < len; i++) {
      if (originalHash[i] !== simulatedContentHash[i]) diffs++;
    }
    return {
      diffCount: diffs,
      percent: ((diffs / len) * 100).toFixed(1),
    };
  }, [originalHash, simulatedContentHash]);

  const handleApplyTamper = () => {
    if (!selectedRecordId) return;
    onSimulateTamper(Number(selectedRecordId));
  };

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
          Observe how modifying an external payload causes the cryptographic SHA-256 chain links to immediately collapse downstream.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Simulation Terminal */}
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-[#242424] rounded-[8px] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <FiAlertOctagon className="w-4 h-4 text-[#c9793f]" />
                <span className="font-mono text-xs uppercase tracking-wider text-[#f0ece9] font-semibold">
                  Payload Mutation Simulator
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#8a8480] bg-[#111111] px-2 py-0.5 rounded border border-[#242424]">
                TARGET BLOCK #{selectedRecordId}
              </span>
            </div>

            {/* Block Selector */}
            <div>
              <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-2">
                Select Block to Alter:
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
                      className={`p-2 rounded-[4px] border font-mono text-xs text-left transition-all ${
                        isSelected
                          ? "border-[#c9793f] bg-[#1a1410] text-[#f0ece9]"
                          : isCompromised
                          ? "border-red-800/60 bg-red-950/20 text-red-400"
                          : "border-[#1f1f1f] bg-[#111111] text-[#8a8480] hover:text-[#f0ece9]"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>Block #{rec.id}</span>
                        {isCompromised && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                      </div>
                      <div className="text-[10px] text-[#5a5654] truncate mt-0.5">
                        {rec.record_id}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edit Payload */}
            <div>
              <label className="block font-mono text-[10px] text-[#8a8480] uppercase mb-1.5 flex items-center justify-between">
                <span>Rogue Injected External Content:</span>
                <span className="text-[#5a5654]">Type below to see live hash flip</span>
              </label>
              <textarea
                value={tamperedPayload}
                onChange={(e) => handleComputeSimulatedHash(e.target.value)}
                rows={3}
                className="w-full bg-[#080808] border border-[#242424] focus:border-[#c9793f] rounded-[4px] p-3 font-mono text-xs text-[#f0ece9] focus:outline-none resize-none transition-colors"
                placeholder="Modify external content..."
              />
            </div>

            {/* Character-by-Character Hex Diff Inspector */}
            <div className="space-y-3 bg-[#050505] p-3.5 rounded border border-[#1a1a1a] font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#161616]">
                <span className="text-[10px] uppercase text-[#8a8480]">Character Hex Diff Analysis</span>
                <span className="text-red-400 text-[10px] font-bold">
                  {hexDiffStats.diffCount} / 64 BITS FLIPPED ({hexDiffStats.percent}%)
                </span>
              </div>

              {/* Original */}
              <div>
                <span className="text-[#5a5654] text-[9px] block uppercase mb-0.5">Original Registered Hash:</span>
                <div className="text-[#8a8480] text-[11px] break-all leading-snug select-all">
                  {originalHash || "—"}
                </div>
              </div>

              {/* Mutated with character highlights */}
              <div>
                <span className="text-red-400 text-[9px] block uppercase mb-0.5">Mutated Hash (Flipped Characters Highlighted):</span>
                <div className="text-[11px] break-all leading-snug select-all font-mono">
                  {simulatedContentHash.split("").map((char, i) => {
                    const isDiff = originalHash[i] !== char;
                    return (
                      <span key={i} className={isDiff ? "hex-char-diff" : "hex-char-match"}>
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1f1f1f]">
            <button
              onClick={handleApplyTamper}
              className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-black bg-red-400 hover:bg-red-300 px-5 py-3 rounded-[4px] transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <FiZap className="w-4 h-4" />
              <span>Simulate Tamper on Block #{selectedRecordId}</span>
            </button>

            {tamperedIds && tamperedIds.size > 0 && (
              <button
                onClick={onResetTamper}
                className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-[#b8b2ae] hover:text-[#f0ece9] bg-[#111111] hover:bg-[#161616] border border-[#242424] px-4 py-3 rounded-[4px] transition-colors"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Restore Clean State</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Forensic Breakdown & Cascade Radar */}
        <div className="lg:col-span-5 instrument-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#f0ece9] font-semibold">
                Cascade Impact Diagnosis
              </span>
              <span className="font-mono text-[9px] text-[#c9793f] bg-[#1a1410] px-2 py-0.5 rounded border border-[#8a5730]/40">
                STRICT AVALANCHE
              </span>
            </div>

            <p className="text-xs text-[#b8b2ae] leading-relaxed">
              Because HashLog constructs every block's entry hash recursively from <code className="text-[#c9793f]">previous_ledger_hash</code>, altering even 1 bit in Block #X completely destroys mathematical link verification for every succeeding block.
            </p>

            {tamperedIds && tamperedIds.size > 0 ? (
              <div className="p-4 bg-red-950/30 border border-red-800/70 rounded-[6px] text-red-300 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-red-400 text-xs">
                  <FiAlertTriangle className="w-4 h-4" />
                  <span>CASCADE COLLAPSE ACTIVE</span>
                </div>
                <p className="text-[11px] text-red-200/90 leading-relaxed font-mono">
                  Origin of Corruption: <strong>Block #{Array.from(tamperedIds)[0]}</strong>
                  <br />
                  Invalidated Blocks Downstream: <strong>[{Array.from(tamperedIds).join(", ")}]</strong>
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/70 rounded-[6px] text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-emerald-400 text-xs">
                  <FiCheck className="w-4 h-4" />
                  <span>CRYPTOGRAPHIC SPINE VERIFIED</span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed font-mono">
                  All SHA-256 linear pointers and per-record version hashes are mathematically congruent.
                </p>
              </div>
            )}

            {/* Zero Knowledge Callout */}
            <div className="bg-[#050505] p-3 rounded border border-[#161616] font-mono text-[10px] text-[#5a5654] space-y-1">
              <div>ZERO-KNOWLEDGE FORMULA:</div>
              <div className="text-[#8a8480]">HashLog stores 0 bytes of external plaintext. Only 32-byte cryptographic commitments are immutably anchored.</div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a1a1a] text-[10px] font-mono text-[#5a5654]">
            Audit Certified · Dual-Chain Linear Verification Engine
          </div>
        </div>
      </div>
    </section>
  );
}

