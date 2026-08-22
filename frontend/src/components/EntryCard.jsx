import { FiUser, FiClock, FiHash } from "react-icons/fi";

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

export default function EntryCard({ entry, tampered, isLast }) {
  const borderColor = tampered
    ? "border-tampered/40 bg-tampered/5"
    : "border-zinc-800/60 bg-zinc-900/50";

  return (
    <div className="relative">
      {/* Chain connector line */}
      {!isLast && (
        <div className="absolute left-6 top-full w-px h-4 bg-zinc-800" />
      )}

      <div
        className={`rounded-xl border ${borderColor} overflow-hidden transition-colors`}
      >
        {/* ID badge */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-500">#{entry.id}</span>
            {tampered && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-tampered bg-tampered/10 px-2 py-0.5 rounded">
                Tampered
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {timeAgo(entry.timestamp)}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-zinc-200 leading-relaxed">{entry.data}</p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            {entry.user_id && (
              <span className="flex items-center gap-1">
                <FiUser size={11} />
                {entry.user_id}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiClock size={11} />
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <FiHash size={11} />
              nonce {entry.nonce}
            </span>
          </div>

          {/* Hashes */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/40">
            <HashRow label="prev" value={entry.prev_hash} />
            <HashRow label="hash" value={entry.entry_hash} highlight />
          </div>
        </div>
      </div>
    </div>
  );
}

function HashRow({ label, value, highlight }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span
        className={`shrink-0 font-mono font-medium ${
          highlight ? "text-accent/70" : "text-zinc-500"
        }`}
      >
        {label}:
      </span>
      <span className="font-mono text-zinc-500 break-all leading-relaxed">
        {truncateHash(value, 16)}
      </span>
    </div>
  );
}
