import { FiShield, FiArrowRight, FiCheckCircle, FiLock, FiLayers } from "react-icons/fi";

export default function Hero({ recordCount, latestHash, onVerifyClick }) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-8 overflow-hidden border-b border-[#1a1a1a]">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-radial from-[#c9793f]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Editorial Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-[#c9793f] mb-6">
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
              className="inline-flex items-center justify-center gap-2 font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase text-black bg-[#f0ece9] hover:bg-white px-6 py-3.5 rounded-[4px] transition-all duration-200 shadow-[0_0_20px_rgba(201,121,63,0.25)] hover:shadow-[0_0_30px_rgba(201,121,63,0.4)]"
            >
              <span>Register Proof</span>
              <FiArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onVerifyClick}
              className="inline-flex items-center justify-center gap-2 font-mono text-xs sm:text-sm font-medium tracking-wider uppercase text-[#b8b2ae] hover:text-[#f0ece9] bg-[#0a0a0a] hover:bg-[#161616] border border-[#242424] hover:border-[#383838] px-5 py-3.5 rounded-[4px] transition-all duration-200"
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

        {/* Right Connected Blockchain Node Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[440px] bg-[#0a0a0a] border border-[#242424] rounded-[8px] p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#f0ece9] font-medium">
                  LEDGER NODE #01
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#8a8480] bg-[#111111] px-2 py-0.5 rounded border border-[#242424]">
                SHA-256
              </span>
            </div>

            {/* Connected Blockchain Line Graphic */}
            <div className="relative py-4 px-2 my-2 bg-[#050505] rounded-[6px] border border-[#161616] overflow-hidden">
              {/* Background ambient beam */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9793f]/5 to-transparent pointer-events-none" />

              {/* Connected Line & Blocks Stream */}
              <div className="relative flex items-center justify-between z-10">
                {/* Genesis Block Node */}
                <div className="flex flex-col items-center group cursor-default shrink-0">
                  <div className="w-10 h-10 rounded-[6px] bg-[#111111] border border-[#2e2e2e] flex flex-col items-center justify-center relative shadow-[0_0_10px_rgba(201,121,63,0.15)] group-hover:border-[#c9793f] transition-colors">
                    <FiLock className="w-3.5 h-3.5 text-[#c9793f]" />
                    <span className="font-mono text-[7px] text-[#8a8480] uppercase">GEN</span>
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#c9793f]" />
                  </div>
                  <span className="font-mono text-[8px] text-[#8a8480] mt-1.5">ROOT</span>
                </div>

                {/* Connecting Line 1 (Arrow touches Block #1) */}
                <div className="flex-1 relative flex items-center justify-center min-w-[28px]">
                  <svg className="w-full h-4 overflow-visible" viewBox="0 0 40 16" preserveAspectRatio="none">
                    <line
                      x1="0"
                      y1="8"
                      x2="34"
                      y2="8"
                      stroke="#c9793f"
                      strokeWidth="2"
                      className="animate-chain-flow"
                    />
                    {/* Arrowhead touching the right edge directly (x=40) */}
                    <polygon points="32,4 40,8 32,12" fill="#c9793f" />
                  </svg>
                </div>

                {/* Block #1 Node */}
                <div className="flex flex-col items-center group cursor-default shrink-0">
                  <div className="w-10 h-10 rounded-[6px] bg-[#0d0d0d] border border-[#242424] flex flex-col items-center justify-center relative shadow-sm group-hover:border-[#c9793f] transition-colors">
                    <span className="font-mono text-[10px] text-[#f0ece9] font-semibold">#1</span>
                    <span className="font-mono text-[7px] text-[#8a8480]">INV</span>
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-[8px] text-[#8a8480] mt-1.5">v1.0</span>
                </div>

                {/* Connecting Line 2 (Arrow touches Block #2) */}
                <div className="flex-1 relative flex items-center justify-center min-w-[28px]">
                  <svg className="w-full h-4 overflow-visible" viewBox="0 0 40 16" preserveAspectRatio="none">
                    <line
                      x1="0"
                      y1="8"
                      x2="34"
                      y2="8"
                      stroke="#c9793f"
                      strokeWidth="2"
                      className="animate-chain-flow"
                    />
                    {/* Arrowhead touching the right edge directly (x=40) */}
                    <polygon points="32,4 40,8 32,12" fill="#c9793f" />
                  </svg>
                </div>

                {/* Block #2 Node */}
                <div className="flex flex-col items-center group cursor-default shrink-0">
                  <div className="w-10 h-10 rounded-[6px] bg-[#0d0d0d] border border-[#242424] flex flex-col items-center justify-center relative shadow-sm group-hover:border-[#c9793f] transition-colors">
                    <span className="font-mono text-[10px] text-[#f0ece9] font-semibold">#2</span>
                    <span className="font-mono text-[7px] text-[#8a8480]">ORD</span>
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-[8px] text-[#8a8480] mt-1.5">v1.0</span>
                </div>

                {/* Connecting Line 3 (Arrow touches TIP Block) */}
                <div className="flex-1 relative flex items-center justify-center min-w-[28px]">
                  <svg className="w-full h-4 overflow-visible" viewBox="0 0 40 16" preserveAspectRatio="none">
                    <line
                      x1="0"
                      y1="8"
                      x2="34"
                      y2="8"
                      stroke="#c9793f"
                      strokeWidth="2"
                      className="animate-chain-flow"
                    />
                    {/* Arrowhead touching the right edge directly (x=40) */}
                    <polygon points="32,4 40,8 32,12" fill="#c9793f" />
                  </svg>
                </div>

                {/* Tip Block Node */}
                <div className="flex flex-col items-center group cursor-default shrink-0">
                  <div className="w-10 h-10 rounded-[6px] bg-[#1a1410] border border-[#c9793f]/80 flex flex-col items-center justify-center relative shadow-[0_0_12px_rgba(201,121,63,0.3)]">
                    <span className="font-mono text-[10px] text-[#c9793f] font-bold">#{recordCount || 4}</span>
                    <span className="font-mono text-[7px] text-[#f0ece9]">TIP</span>
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
                  </div>
                  <span className="font-mono text-[8px] text-[#c9793f] font-medium mt-1.5">HEAD</span>
                </div>
              </div>

              {/* Sub-label under connected chain */}
              <div className="mt-3 pt-2 border-t border-[#111111] flex items-center justify-between text-[8px] font-mono text-[#5a5654]">
                <span>◄ PREV_LEDGER_HASH</span>
                <span className="text-[#8a8480]">DIRECTIONAL HASH COMMITMENT</span>
                <span>ENTRY_HASH ►</span>
              </div>
            </div>

            {/* Clean Telemetry Details */}
            <div className="space-y-2 pt-2 border-t border-[#1a1a1a] font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8a8480]">Anchored Proofs</span>
                <span className="text-[#f0ece9] font-medium">{recordCount} blocks</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a8480]">Ledger State</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <FiCheckCircle className="w-3 h-3" /> Synchronized
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a8480]">Latest Proof Hash</span>
                <span className="text-[#b8b2ae] font-mono text-[11px] truncate max-w-[160px] select-all">
                  {latestHash ? `${latestHash.slice(0, 10)}...${latestHash.slice(-6)}` : "d9e830c2b1...8201fe"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}




