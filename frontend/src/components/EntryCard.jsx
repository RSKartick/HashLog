import { FiDatabase, FiTag, FiHash, FiClock, FiLink2, FiLayers } from "react-icons/fi";

function truncateHash(hash, chars = 12) {
  if (!hash) return "—";
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function EntryCard({ record, tampered, isLast }) {
  const borderColor = tampered
    ? "border-tampered/40 bg-tampered/5"
    : "border-zinc-800/60 bg-zinc-900/50";

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-6 top-full w-px h-4 bg-zinc-800" />
      )}

      <div className={`rounded-xl border ${borderColor} overflow-hidden transition-colors`}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-500">#{record.id}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-accent/70 bg-accent/10 px-2 py-0.5 rounded">
              v{record.version_number}
            </span>
            {tampered && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-tampered bg-tampered/10 px-2 py-0.5 rounded">
                Tampered
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {timeAgo(record.timestamp)}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3">
          {/* Identity */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <IdentityBadge icon={<FiDatabase size={11} />} label={record.source_system} />
            <IdentityBadge icon={<FiTag size={11} />} label={record.record_type} />
            <IdentityBadge icon={<FiHash size={11} />} label={record.record_id} accent />
          </div>

          {/* Metadata */}
          {record.metadata && (
            <div className="flex items-start gap-2 text-xs">
              <FiLayers size={11} className="shrink-0 text-zinc-500 mt-0.5" />
              <span className="font-mono text-zinc-400 break-all leading-relaxed">
                {typeof record.metadata === "string"
                  ? record.metadata
                  : JSON.stringify(record.metadata)}
              </span>
            </div>
          )}

          {/* Hashes */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/40">
            <HashRow label="content" value={record.content_hash} />
            <HashRow label="prev ver" value={record.previous_version_hash} />
            <HashRow label="prev led" value={truncateHash(record.previous_ledger_hash, 16)} />
            <HashRow label="entry" value={record.entry_hash} highlight />
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <FiClock size={11} />
            <span className="font-mono">{record.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IdentityBadge({ icon, label, accent }) {
  return (
    <span className={`flex items-center gap-1 ${accent ? "text-zinc-200 font-medium" : "text-zinc-500"}`}>
      {icon}
      {label}
    </span>
  );
}

function HashRow({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`shrink-0 font-mono font-medium w-16 ${highlight ? "text-accent/70" : "text-zinc-500"}`}>
        {label}:
      </span>
      <span className="font-mono text-zinc-500 break-all leading-relaxed">
        {truncateHash(value, 16)}
      </span>
    </div>
  );
}
