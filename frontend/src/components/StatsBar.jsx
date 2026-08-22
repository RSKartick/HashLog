import { useState } from "react";
import { FiDatabase, FiShield, FiCheckCircle, FiAlertTriangle, FiCopy, FiCheck, FiCpu, FiLock, FiActivity, FiArrowUpRight } from "react-icons/fi";

export default function StatsBar({ recordCount, verifyResult, latestHash, checkpointsCount }) {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = async () => {
    if (!latestHash) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(latestHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this ledger root hash:", latestHash);
    }
  };

  const isTampered = verifyResult && !verifyResult.valid;
  const isValid = verifyResult && verifyResult.valid;

  return (
    <section id="explorer" className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3 pb-4 border-b border-[#161616]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#c9793f] animate-pulse" />
            <span>TELEMETRY & SYSTEM STATE</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f0ece9] font-normal tracking-tight">
            Ledger Overview
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ledger Live</span>
          </div>
        </div>
      </div>

      {/* 4 Connected Telemetry Cards Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-0 relative">
        {/* Card 1: Anchored Proofs */}
        <div className="relative flex items-center">
          <div className="w-full bg-gradient-to-b from-[#0e0e0e] to-[#060606] border border-[#1f1f1f] hover:border-[#c9793f]/50 rounded-[8px] p-5 transition-all duration-300 group hover:shadow-[0_8px_25px_rgba(201,121,63,0.08)] relative z-10">
            {/* Outgoing socket pin */}
            <div className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#c9793f] border border-[#000000] z-20 shadow-[0_0_6px_#c9793f]" />

            <div className="flex items-center justify-between text-[#8a8480] mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a8480]">
                Anchored Proofs
              </span>
              <div className="w-7 h-7 rounded-full bg-[#141414] border border-[#242424] flex items-center justify-center text-[#c9793f] group-hover:scale-105 transition-transform">
                <FiDatabase className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-serif text-3xl sm:text-4xl text-[#f0ece9] font-normal">
                {recordCount}
              </span>
              <span className="font-mono text-xs text-[#8a8480]">blocks</span>
            </div>

            {/* Micro Block Progression Bar */}
            <div className="space-y-1.5 pt-2 border-t border-[#161616]">
              <div className="flex gap-1 h-1.5">
                {recordCount > 0 ? (
                  Array.from({ length: Math.min(recordCount, 8) }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#c9793f] rounded-full opacity-80 transition-all"
                      style={{ opacity: 0.4 + (i / 8) * 0.6 }}
                    />
                  ))
                ) : (
                  <div className="flex-1 bg-[#1a1a1a] rounded-full" />
                )}
              </div>
              <p className="font-mono text-[10px] text-[#5a5654] flex justify-between">
                <span>Monotonic sequence</span>
                <span className="text-[#8a8480]">H: {recordCount}</span>
              </p>
            </div>
          </div>

          {/* Connecting Arrow 1 -> 2 (Desktop) */}
          <div className="hidden lg:flex w-6 relative items-center justify-center -mx-[1px] z-0">
            <svg className="w-full h-4 overflow-visible" viewBox="0 0 24 16" preserveAspectRatio="none">
              <line
                x1="0"
                y1="8"
                x2="18"
                y2="8"
                stroke="#c9793f"
                strokeWidth="2"
                className="animate-chain-flow"
              />
              <polygon points="16,4 24,8 16,12" fill="#c9793f" />
            </svg>
          </div>
        </div>

        {/* Card 2: Integrity Status */}
        <div className="relative flex items-center">
          <a
            href="#verify"
            className={`w-full bg-gradient-to-b from-[#0e0e0e] to-[#060606] border rounded-[8px] p-5 transition-all duration-300 group block relative z-10 ${
              isTampered
                ? "!border-red-600/70 bg-gradient-to-b from-red-950/20 to-[#060606] shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                : isValid
                ? "!border-emerald-600/70 bg-gradient-to-b from-emerald-950/20 to-[#060606] shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "border-[#1f1f1f] hover:border-[#c9793f]/50 hover:shadow-[0_8px_25px_rgba(201,121,63,0.08)]"
            }`}
          >
            {/* Incoming socket pin */}
            <div className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#c9793f] border border-[#000000] z-20 shadow-[0_0_6px_#c9793f]" />
            {/* Outgoing socket pin */}
            <div className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#c9793f] border border-[#000000] z-20 shadow-[0_0_6px_#c9793f]" />

            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a8480]">
                Integrity Status
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  isTampered
                    ? "bg-red-950 border-red-800/80 text-red-400"
                    : isValid
                    ? "bg-emerald-950 border-emerald-800/80 text-emerald-400"
                    : "bg-[#141414] border-[#242424] text-[#c9793f]"
                }`}
              >
                {isTampered ? (
                  <FiAlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                ) : isValid ? (
                  <FiCheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <FiShield className="w-3.5 h-3.5" />
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
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

            <div className="pt-2 border-t border-[#161616] flex items-center justify-between font-mono text-[10px]">
              <span className="text-[#8a8480] truncate max-w-[120px]">
                {isTampered
                  ? `Fracture at #${verifyResult.tampered_at}`
                  : isValid
                  ? "All chains intact"
                  : "Ready for audit"}
              </span>
              <span className="text-[#c9793f] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Audit <FiArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </a>

          {/* Connecting Arrow 2 -> 3 (Desktop) */}
          <div className="hidden lg:flex w-6 relative items-center justify-center -mx-[1px] z-0">
            <svg className="w-full h-4 overflow-visible" viewBox="0 0 24 16" preserveAspectRatio="none">
              <line
                x1="0"
                y1="8"
                x2="18"
                y2="8"
                stroke="#c9793f"
                strokeWidth="2"
                className="animate-chain-flow"
              />
              <polygon points="16,4 24,8 16,12" fill="#c9793f" />
            </svg>
          </div>
        </div>

        {/* Card 3: Tip Ledger Root */}
        <div className="relative flex items-center">
          <div className="w-full bg-gradient-to-b from-[#0e0e0e] to-[#060606] border border-[#1f1f1f] hover:border-[#c9793f]/50 rounded-[8px] p-5 transition-all duration-300 group hover:shadow-[0_8px_25px_rgba(201,121,63,0.08)] relative z-10">
            {/* Incoming socket pin */}
            <div className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#c9793f] border border-[#000000] z-20 shadow-[0_0_6px_#c9793f]" />
            {/* Outgoing socket pin */}
            <div className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#c9793f] border border-[#000000] z-20 shadow-[0_0_6px_#c9793f]" />

            <div className="flex items-center justify-between text-[#8a8480] mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a8480]">
                Tip Ledger Root
              </span>
              <button
                onClick={handleCopyHash}
                className="w-7 h-7 rounded-full bg-[#141414] hover:bg-[#1f1f1f] border border-[#242424] flex items-center justify-center text-[#b8b2ae] hover:text-[#f0ece9] transition-colors"
                title="Copy Root Hash"
              >
                {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Copyable Hash Pill */}
            <div
              onClick={handleCopyHash}
              className={`bg-[#050505] p-2.5 rounded border border-[#1a1a1a] font-mono text-[11px] break-all select-all mb-3 ${latestHash ? "cursor-pointer hover:bg-[#0a0a0a] hover:border-[#2e2e2e] text-[#f0ece9]" : "text-[#5a5654]"}`}
            >
              {latestHash ? `${latestHash.slice(0, 11)}...${latestHash.slice(-7)}` : "— no anchor yet"}
            </div>

            <div className="pt-2 border-t border-[#161616] flex items-center justify-between font-mono text-[10px] text-[#5a5654]">
              <span>SHA-256</span>
              <span className={copied ? "text-emerald-400" : "text-[#8a8480]"}>
                {copied ? "Copied!" : "Click to copy"}
              </span>
            </div>
          </div>

          {/* Connecting Arrow 3 -> 4 (Desktop) */}
          <div className="hidden lg:flex w-6 relative items-center justify-center -mx-[1px] z-0">
            <svg className="w-full h-4 overflow-visible" viewBox="0 0 24 16" preserveAspectRatio="none">
              <line
                x1="0"
                y1="8"
                x2="18"
                y2="8"
                stroke="#c9793f"
                strokeWidth="2"
                className="animate-chain-flow"
              />
              <polygon points="16,4 24,8 16,12" fill="#c9793f" />
            </svg>
          </div>
        </div>

        {/* Card 4: Freeze Anchors */}
        <div className="relative flex items-center">
          <a
            href="#checkpoints"
            className="w-full bg-gradient-to-b from-[#0e0e0e] to-[#060606] border border-[#1f1f1f] hover:border-[#c9793f]/50 rounded-[8px] p-5 transition-all duration-300 group block hover:shadow-[0_8px_25px_rgba(201,121,63,0.08)] relative z-10"
          >
            {/* Incoming socket pin */}
            <div className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#c9793f] border border-[#000000] z-20 shadow-[0_0_6px_#c9793f]" />

            <div className="flex items-center justify-between text-[#8a8480] mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a8480]">
                Freeze Anchors
              </span>
              <div className="w-7 h-7 rounded-full bg-[#141414] border border-[#242424] flex items-center justify-center text-[#c9793f] group-hover:scale-105 transition-transform">
                <FiLock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-serif text-3xl sm:text-4xl text-[#f0ece9] font-normal">
                {checkpointsCount}
              </span>
              <span className="font-mono text-xs text-[#8a8480]">snapshots</span>
            </div>

            <div className="pt-2 border-t border-[#161616] flex items-center justify-between font-mono text-[10px]">
              <span className="text-[#5a5654] truncate max-w-[120px]">
                State locks
              </span>
              <span className="text-[#c9793f] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Snapshots <FiArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}


