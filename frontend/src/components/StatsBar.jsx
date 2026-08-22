import { useState } from "react";
import { FiDatabase, FiShield, FiCheckCircle, FiAlertTriangle, FiCopy, FiCheck, FiCpu, FiHash } from "react-icons/fi";

export default function StatsBar({ recordCount, verifyResult, latestHash, checkpointsCount, mockMode }) {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    if (!latestHash) return;
    navigator.clipboard.writeText(latestHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTampered = verifyResult && !verifyResult.valid;
  const isValid = verifyResult && verifyResult.valid;

  return (
    <section id="explorer" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#8a8480] block mb-1">
            TELEMETRY & STATE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal">
            Ledger Overview
          </h2>
        </div>
        {mockMode && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2e2e2e] text-[11px] font-mono text-[#b8b2ae]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Local Mock Runtime</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Proofs Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#2e2e2e] rounded-[8px] p-5 transition-all group">
          <div className="flex items-center justify-between text-[#8a8480] mb-3">
            <span className="font-mono text-xs uppercase tracking-wider">Anchored Proofs</span>
            <FiDatabase className="w-4 h-4 text-[#c9793f] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl text-[#f0ece9] font-normal">
              {recordCount}
            </span>
            <span className="font-mono text-xs text-[#8a8480]">blocks</span>
          </div>
          <p className="font-mono text-[11px] text-[#5a5654] mt-2">
            Append-only linear sequence
          </p>
        </div>

        {/* Verification Status Card */}
        <div
          className={`border rounded-[8px] p-5 transition-all group ${
            isTampered
              ? "bg-red-950/20 border-red-800/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
              : isValid
              ? "bg-emerald-950/20 border-emerald-800/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              : "bg-[#0a0a0a] border-[#1f1f1f] hover:border-[#2e2e2e]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#8a8480]">
              Integrity Status
            </span>
            {isTampered ? (
              <FiAlertTriangle className="w-4 h-4 text-red-400" />
            ) : isValid ? (
              <FiCheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <FiShield className="w-4 h-4 text-[#c9793f]" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-serif text-2xl sm:text-3xl font-normal ${
                isTampered
                  ? "text-red-400"
                  : isValid
                  ? "text-emerald-400"
                  : "text-[#f0ece9]"
              }`}
            >
              {isTampered ? "Compromised" : isValid ? "Verified" : "Unverified"}
            </span>
          </div>
          <p className="font-mono text-[11px] text-[#8a8480] mt-2 truncate">
            {isTampered
              ? `Tamper detected at #${verifyResult.tampered_at}`
              : isValid
              ? "All SHA-256 chains verified"
              : "Ready for verification run"}
          </p>
        </div>

        {/* Latest Ledger Root Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#2e2e2e] rounded-[8px] p-5 transition-all group">
          <div className="flex items-center justify-between text-[#8a8480] mb-3">
            <span className="font-mono text-xs uppercase tracking-wider">Ledger Root</span>
            <button
              onClick={handleCopyHash}
              className="p-1 rounded bg-[#161616] hover:bg-[#242424] text-[#b8b2ae] hover:text-[#f0ece9] transition-colors"
              title="Copy Root Hash"
            >
              {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="font-mono text-xs sm:text-sm text-[#f0ece9] break-all bg-[#111111] p-2 rounded border border-[#1f1f1f] select-all">
            {latestHash ? `${latestHash.slice(0, 14)}...${latestHash.slice(-8)}` : "GENESIS"}
          </div>
          <p className="font-mono text-[11px] text-[#5a5654] mt-2">
            Current tip of ledger hash chain
          </p>
        </div>

        {/* Checkpoints Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#2e2e2e] rounded-[8px] p-5 transition-all group">
          <div className="flex items-center justify-between text-[#8a8480] mb-3">
            <span className="font-mono text-xs uppercase tracking-wider">Checkpoints</span>
            <FiCpu className="w-4 h-4 text-[#c9793f] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl text-[#f0ece9] font-normal">
              {checkpointsCount}
            </span>
            <span className="font-mono text-xs text-[#8a8480]">anchors</span>
          </div>
          <p className="font-mono text-[11px] text-[#5a5654] mt-2">
            Independent cryptographic checkpoints
          </p>
        </div>
      </div>
    </section>
  );
}
