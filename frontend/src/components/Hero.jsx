import { FiShield, FiArrowRight, FiCheckCircle, FiActivity, FiKey, FiLock, FiCpu } from "react-icons/fi";

export default function Hero({ recordCount, latestHash, onVerifyClick }) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-8 overflow-hidden border-b border-[#1a1a1a]">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[450px] bg-radial from-[#c9793f]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Veluna styled background graphic lines */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-5 overflow-hidden hidden lg:block">
        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
          <circle cx="200" cy="200" r="90" stroke="white" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="white" strokeWidth="1" />
          <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Editorial Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#b8b2ae] mb-6">
            <span className="w-6 h-[1px] bg-[#c9793f]" />
            <span>EXTERNAL INTEGRITY LEDGER</span>
          </div>

          {/* Headline with Serif & Italic */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] font-normal leading-[1.05] tracking-tight text-[#f0ece9] mb-6">
            Cryptographic <em className="font-light italic text-[#c9793f]">proof</em> without data exposure.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#b8b2ae] leading-relaxed max-w-xl font-light mb-8">
            HashLog persists immutable SHA-256 proofs linked in an append-only ledger.
            Detect silent database drift, unauthorized row alterations, and rogue record deletions with mathematical certainty.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10 w-full sm:w-auto">
            <a
              href="#register"
              className="inline-flex items-center justify-center gap-2 font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase text-black bg-[#f0ece9] hover:bg-white px-6 py-3.5 rounded-[6px] transition-all duration-200 shadow-[0_0_20px_rgba(201,121,63,0.25)] hover:shadow-[0_0_30px_rgba(201,121,63,0.4)]"
            >
              <span>Register Proof</span>
              <FiArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onVerifyClick}
              className="inline-flex items-center justify-center gap-2 font-mono text-xs sm:text-sm font-medium tracking-wider uppercase text-[#b8b2ae] hover:text-[#f0ece9] bg-[#0a0a0a] hover:bg-[#161616] border border-[#242424] hover:border-[#383838] px-5 py-3.5 rounded-[6px] transition-all duration-200"
            >
              <FiShield className="w-4 h-4 text-[#c9793f]" />
              <span>Verify Ledger</span>
            </button>
          </div>

          {/* Micro badges */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#8a8480] font-mono border-t border-[#1a1a1a] pt-6 w-full">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9793f]" />
              <span>Zero-Knowledge Proofs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Dual-Chain Lineage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9793f]" />
              <span>Independent Anchors</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Cryptographic Visualizer */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[420px] bg-[#0a0a0a] border border-[#242424] rounded-[10px] p-6 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.9)] relative overflow-hidden group hover:border-[#383838] transition-all">
            {/* Corner glowing badge */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#b8b2ae]">
                  LEDGER NODE #01
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#8a8480] bg-[#111111] px-2 py-0.5 rounded border border-[#242424]">
                SHA-256
              </span>
            </div>

            {/* Rotating Cryptographic Ring / Seal Graphic */}
            <div className="relative h-48 w-full flex items-center justify-center my-3">
              {/* Outer dashed rotating orbit */}
              <div className="absolute w-44 h-44 rounded-full border border-dashed border-[#2e2e2e] animate-crypto-spin opacity-40" />

              {/* Middle reverse orbit with nodes */}
              <div className="absolute w-32 h-32 rounded-full border border-[#c9793f]/30 animate-crypto-spin-reverse flex items-center justify-center">
                <span className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-[#c9793f] shadow-[0_0_8px_#c9793f]" />
                <span className="absolute -bottom-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              </div>

              {/* Center Cryptographic Core */}
              <div className="relative z-10 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-[#111111] border border-[#2e2e2e] shadow-[0_0_20px_rgba(201,121,63,0.2)]">
                <FiLock className="w-6 h-6 text-[#c9793f]" />
                <span className="font-mono text-[8px] text-[#8a8480] mt-0.5 tracking-tighter">GENESIS</span>
              </div>
            </div>

            {/* Live Ledger Metrics Strip inside Card */}
            <div className="space-y-2 mt-4 pt-4 border-t border-[#1a1a1a]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a8480]">Total Anchored Proofs</span>
                <span className="text-[#f0ece9] font-medium">{recordCount} blocks</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a8480]">Ledger State</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <FiCheckCircle className="w-3 h-3" /> Synchronized
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a8480]">Latest Proof Hash</span>
                <span className="text-[#b8b2ae] font-mono text-[11px] truncate max-w-[150px]">
                  {latestHash ? `${latestHash.slice(0, 10)}...${latestHash.slice(-6)}` : "GENESIS_ROOT"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

