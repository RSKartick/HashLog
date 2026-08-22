import { FiServer, FiActivity } from "react-icons/fi";

export default function StatusBar({ health, onRefresh }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 rounded-xl border border-zinc-800/40 bg-zinc-900/30 text-xs text-zinc-500">
      <div className="flex items-center gap-2">
        <FiServer size={12} />
        <span className="font-mono">
          {health ? (
            <>
              API online &middot; {health.total_hash_records} hash records
            </>
          ) : (
            "API offline"
          )}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            health ? "bg-valid" : "bg-tampered"
          }`}
        />
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <FiActivity size={12} />
        refresh
      </button>
    </div>
  );
}
