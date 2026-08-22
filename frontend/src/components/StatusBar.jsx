import { FiActivity, FiServer, FiLock, FiTerminal, FiExternalLink } from "react-icons/fi";

export default function StatusBar({ health, onRefresh }) {
  return (
    <footer className="w-full border-t border-[#1a1a1a] bg-[#050505] py-12 px-4 sm:px-8 mt-20 text-[#8a8480] font-mono text-xs">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
        {/* Left Column: Brand & Guarantee */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#c9793f]">
              <FiLock className="w-3 h-3" />
            </div>
            <span className="font-semibold text-sm text-[#f0ece9] tracking-wider">
              hash<span className="text-[#c9793f]">log</span>
            </span>
          </div>
          <p className="text-[#8a8480] text-xs leading-relaxed max-w-sm">
            Zero-knowledge cryptographic external ledger. Persisting mathematical proofs of enterprise record authenticity with SHA-256 chain links.
          </p>
          <div className="text-[11px] text-[#5a5654]">
            Content Hash: <code className="text-[#8a8480]">SHA-256(external_payload)</code>
          </div>
        </div>

        {/* Middle Column: API Endpoints Quick Reference */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#b8b2ae] block font-semibold mb-2">
            API Endpoints
          </span>
          <ul className="space-y-1.5 text-[11px] text-[#8a8480]">
            <li className="flex items-center gap-2">
              <span className="text-[#c9793f] font-bold">POST</span>
              <span>/api/records/register</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#c9793f] font-bold">POST</span>
              <span>/api/records/import</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">GET</span>
              <span>/api/ledger/verify</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">GET</span>
              <span>/api/records</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Node Pulse & Refresh */}
        <div className="md:col-span-3 space-y-3 md:text-right">
          <span className="text-[10px] uppercase tracking-wider text-[#b8b2ae] block font-semibold mb-2">
            Ledger Node State
          </span>
          <div className="flex md:justify-end items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                health ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span className="text-[#f0ece9]">
              {health ? "Node Online (Port 8000)" : "Node Unreachable"}
            </span>
          </div>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#111111] hover:bg-[#1f1f1f] border border-[#242424] text-[#b8b2ae] hover:text-[#f0ece9] transition-colors"
          >
            <FiActivity className="w-3 h-3 text-[#c9793f]" />
            <span>Poll Heartbeat</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-[#161616] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#5a5654]">
        <div>HashLog Ledger · Append-Only Cryptographic Proofs</div>
        <div className="flex items-center gap-4">
          <span>SHA-256</span>
          <span>·</span>
          <span>Zero-Knowledge</span>
          <span>·</span>
          <span>Dual-Chain Lineage</span>
        </div>
      </div>
    </footer>
  );
}

