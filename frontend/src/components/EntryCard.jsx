import { useState } from "react";
import { FiDatabase, FiTag, FiHash, FiClock, FiLayers, FiCopy, FiCheck, FiChevronDown, FiChevronUp, FiShield } from "react-icons/fi";

function truncateHash(hash, chars = 10) {
  if (!hash) return "—";
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export default function EntryCard({ record, tampered }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const copyText = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div
      className={`instrument-card transition-all duration-200 ${
        tampered
          ? "!border-red-600/80 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          : "hover:border-[#383838]"
      }`}
    >
      {/* Top Banner Row */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#f0ece9]">
            #{record.id}
          </span>
          <span className="font-mono text-[9px] font-medium text-[#c9793f] bg-[#1a1410] px-2 py-0.5 rounded border border-[#8a5730]/40">
            v{record.version_number}
          </span>
          {tampered && (
            <span className="font-mono text-[9px] font-semibold uppercase text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800/60">
              TAMPERED
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#8a8480] font-mono">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3 text-[#5a5654]" />
            <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
          </span>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="p-4 space-y-3">
        {/* Identity pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded-[3px] border border-[#1f1f1f] text-[#f0ece9]">
            <FiHash className="w-3.5 h-3.5 text-[#c9793f]" />
            <span className="font-medium">{record.record_id}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded-[3px] border border-[#1f1f1f] text-[#b8b2ae]">
            <FiDatabase className="w-3.5 h-3.5 text-[#8a8480]" />
            <span>{record.source_system}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded-[3px] border border-[#1f1f1f] text-[#b8b2ae]">
            <FiTag className="w-3.5 h-3.5 text-[#8a8480]" />
            <span>{record.record_type}</span>
          </div>
        </div>

        {/* Cryptographic Hashes Grid */}
        <div className="space-y-1.5 bg-[#050505] p-3 rounded border border-[#161616] font-mono text-xs">
          {/* Entry Hash */}
          <div className="flex items-center justify-between">
            <span className="text-[#c9793f] font-semibold text-[11px]">entry_hash:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#f0ece9] select-all text-[11px]">
                {truncateHash(record.entry_hash, 12)}
              </span>
              <button
                onClick={() => copyText(record.entry_hash, `entry-${record.id}`)}
                className="p-1 rounded bg-[#111111] hover:bg-[#1f1f1f] text-[#8a8480] hover:text-[#f0ece9] transition-colors"
                title="Copy Full Hash"
              >
                {copiedKey === `entry-${record.id}` ? (
                  <FiCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <FiCopy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Content Hash */}
          <div className="flex items-center justify-between text-[#8a8480]">
            <span className="text-[11px]">content_hash:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#b8b2ae] select-all text-[11px]">
                {truncateHash(record.content_hash, 12)}
              </span>
              <button
                onClick={() => copyText(record.content_hash, `content-${record.id}`)}
                className="p-1 rounded bg-[#111111] hover:bg-[#1f1f1f] text-[#8a8480] hover:text-[#f0ece9] transition-colors"
                title="Copy Full Hash"
              >
                {copiedKey === `content-${record.id}` ? (
                  <FiCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <FiCopy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Previous Ledger Hash */}
          <div className="flex items-center justify-between text-[#5a5654] text-[10px]">
            <span>prev_ledger:</span>
            <span className="truncate max-w-[150px]">{record.previous_ledger_hash ? truncateHash(record.previous_ledger_hash, 10) : "GENESIS"}</span>
          </div>

          {/* Previous Version Hash */}
          {record.previous_version_hash && (
            <div className="flex items-center justify-between text-[#5a5654] text-[10px]">
              <span>prev_version:</span>
              <span className="truncate max-w-[150px]">{truncateHash(record.previous_version_hash, 10)}</span>
            </div>
          )}
        </div>

        {/* Expandable Metadata & Raw View */}
        {record.metadata && Object.keys(record.metadata).length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 font-mono text-[10px] text-[#8a8480] hover:text-[#f0ece9] transition-colors"
            >
              <FiLayers className="w-3 h-3 text-[#c9793f]" />
              <span>Metadata Certificate</span>
              {expanded ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            </button>

            {expanded && (
              <pre className="mt-2 p-2.5 bg-[#050505] border border-[#161616] rounded text-[11px] font-mono text-[#b8b2ae] overflow-x-auto">
                {JSON.stringify(record.metadata, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


