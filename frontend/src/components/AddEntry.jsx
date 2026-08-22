import { useState } from "react";
import { FiPlus, FiUser, FiFileText } from "react-icons/fi";

export default function AddEntry({ onSubmit, loading }) {
  const [data, setData] = useState("");
  const [userId, setUserId] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.trim() || loading) return;
    onSubmit({ data: data.trim(), user_id: userId.trim() || undefined });
    setData("");
  };

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent">
            <FiPlus size={16} strokeWidth={2.2} />
          </div>
          <span className="text-sm font-medium text-zinc-200">
            New Entry
          </span>
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          {expanded ? "collapse" : "expand"}
        </span>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
          <div className="relative">
            <FiFileText
              size={14}
              className="absolute left-3 top-3 text-zinc-500"
            />
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Log entry data..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-9 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-accent/50 transition-colors font-mono"
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <FiUser
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID (optional)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!data.trim() || loading}
              className="px-5 py-2 rounded-lg bg-accent text-zinc-950 text-sm font-medium hover:bg-accent-dim disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                <FiPlus size={14} strokeWidth={2.5} />
              )}
              Append
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
