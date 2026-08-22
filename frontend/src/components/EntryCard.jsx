import { useState } from "react";
import { FiDatabase, FiTag, FiHash, FiClock, FiLayers, FiCopy, FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";

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
      className={`bg-[#0a0a0a] border rounded-[8px] transition-all duration-200 ${
        tampered
          ? "border-red-600/70 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          : "border-[#1f1f1f] hover:border-[#2e2e2e]"
      }`}
    >
      {/* Top Banner Row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#161616]">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-semibold text-[#f0ece9]">
            #{record.id}
          </span>
          <span className="font-mono text-[10px] font-medium text-[#c9793f] bg-[#1a1410] px-2 py-0.5 rounded border border-[#8a5730]/40">
            v{record.version_number}
          </span>
          {tampered && (
            <span className="font-mono text-[10px] font-semibold uppercase text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800/60">
              TAMPERED
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#8a8480] font-mono">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3 text-[#5a5654]" />
            <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
          </span>
        </div>
      </div>

      {/* Main Content Info */}
      <div className="p-5 space-y-4">
        {/* Identity pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded border border-[#1f1f1f] text-[#f0ece9]">
            <FiHash className="w-3.5 h-3.5 text-[#c9793f]" />
            <span className="font-medium">{record.record_id}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded border border-[#1f1f1f] text-[#b8b2ae]">
            <FiDatabase className="w-3.5 h-3.5 text-[#8a8480]" />
            <span>{record.source_system}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111111] px-2.5 py-1 rounded border border-[#1f1f1f] text-[#b8b2ae]">
            <FiTag className="w-3.5 h-3.5 text-[#8a8480]" />
            <span>{record.record_type}</span>
          </div>
        </div>

        {/* Cryptographic Hashes Grid */}
        <div className="space-y-2 bg-[#080808] p-3.5 rounded-[6px] border border-[#161616] font-mono text-xs">
          {/* Entry Hash */}
          <div className="flex items-center justify-between">
            <span className="text-[#c9793f] font-semibold flex items-center gap-1">
              <span>entry_hash:</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#f0ece9] select-all">
                {truncateHash(record.entry_hash, 14)}
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
            <span>content_hash:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#b8b2ae] select-all">
                {truncateHash(record.content_hash, 14)}
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
          <div className="flex items-center justify-between text-[#5a5654] text-[11px]">
            <span>previous_ledger_hash:</span>
            <span>{record.previous_ledger_hash ? truncateHash(record.previous_ledger_hash, 12) : "GENESIS"}</span>
          </div>

          {/* Previous Version Hash */}
          {record.previous_version_hash && (
            <div className="flex items-center justify-between text-[#5a5654] text-[11px]">
              <span>previous_version_hash:</span>
              <span>{truncateHash(record.previous_version_hash, 12)}</span>
            </div>
          )}
        </div>

        {/* Expandable Metadata & Raw View */}
        {record.metadata && Object.keys(record.metadata).length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 font-mono text-[11px] text-[#8a8480] hover:text-[#f0ece9] transition-colors"
            >
              <FiLayers className="w-3.5 h-3.5 text-[#c9793f]" />
              <span>Metadata & Details</span>
              {expanded ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
            </button>

            {expanded && (
              <pre className="mt-2 p-3 bg-[#080808] border border-[#161616] rounded-[6px] text-xs font-mono text-[#b8b2ae] overflow-x-auto">
                {JSON.stringify(record.metadata, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

