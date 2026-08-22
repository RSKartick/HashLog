import { useState } from "react";
import { FiBookmark, FiCheck, FiClock } from "react-icons/fi";
import { createCheckpoint, listCheckpoints } from "../api.js";

export default function CheckpointButton() {
  const [loading, setLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState([]);
  const [showList, setShowList] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const cp = await createCheckpoint();
      setLastCreated(cp);
      setCheckpoints((prev) => [cp, ...prev]);
      setTimeout(() => setLastCreated(null), 3000);
    } catch {
      // backend offline
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (showList) {
      setShowList(false);
      return;
    }
    try {
      const list = await listCheckpoints();
      setCheckpoints(list);
    } catch {
      // keep current state
    }
    setShowList(true);
  };

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400">
            <FiBookmark size={16} />
          </div>
          <span className="text-sm font-medium text-zinc-200">
            Checkpoints
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
          >
            {showList ? "hide" : "history"}
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
            ) : lastCreated ? (
              <FiCheck size={12} className="text-valid" />
            ) : (
              <FiBookmark size={12} />
            )}
            {lastCreated ? "Created" : "Snapshot"}
          </button>
        </div>
      </div>

      {showList && (
        <div className="px-5 pb-4 space-y-2 max-h-48 overflow-y-auto">
          {checkpoints.length === 0 ? (
            <p className="text-xs text-zinc-500">No checkpoints yet</p>
          ) : (
            checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800/40"
              >
                <div className="flex items-center gap-2 text-xs">
                  <FiClock size={11} className="text-zinc-500" />
                  <span className="text-zinc-400">
                    #{cp.id} &middot; record #{cp.last_record_id}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-600">
                  {cp.ledger_hash?.slice(0, 16)}...
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
